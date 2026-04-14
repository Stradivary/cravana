# ============================================================================
# Test Webhook Payment Script untuk Xendit QRIS Payment Simulation
# ============================================================================
# Penggunaan:
#   1. Buka PowerShell dan navigasi ke folder backend
#   2. Jalankan: .\test-webhook-payment.ps1
#   3. Script akan otomatis:
#      a) Load env variables dari .env.local
#      b) Cari order pending terbaru
#      c) Trigger webhook dengan status SUCCEEDED
#      d) Verify order status berubah dari pending -> paid
#
# Tips:
#   - Pastikan backend running di port 3100
#   - Pastikan .env.local sudah punya SUPABASE_URL, SERVICE_ROLE_KEY, XENDIT_WEBHOOK_TOKEN
# ============================================================================

param(
    [string]$Status = "SUCCEEDED",  # SUCCEEDED, EXPIRED, FAILED
    [string]$OrderId = $null,        # Jika null, akan ambil pending order terbaru
    [switch]$Verbose = $false        # Tampilkan detail log
)

$ErrorActionPreference = 'Stop'

try {
    # ========== STEP 1: Load Environment Variables ==========
    Write-Host "┌─ STEP 1: Loading environment variables" -ForegroundColor Cyan
    
    if (-not (Test-Path .\.env.local)) {
        throw "ERROR: .env.local not found in current directory. Please run from backend folder."
    }
    
    $envMap = @{}
    Get-Content .\.env.local | 
        Where-Object { $_ -match '^[A-Z0-9_]+=' } | 
        ForEach-Object { 
            $k, $v = $_ -split '=', 2
            $envMap[$k] = $v
        }
    
    $supabaseUrl = $envMap['SUPABASE_URL']
    $serviceKey = $envMap['SUPABASE_SERVICE_ROLE_KEY']
    $webhookToken = $envMap['XENDIT_WEBHOOK_TOKEN']
    $backendUrl = $envMap['BACKEND_URL'] ?? 'http://127.0.0.1:3100'
    
    if (-not $supabaseUrl -or -not $serviceKey -or -not $webhookToken) {
        throw "Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, XENDIT_WEBHOOK_TOKEN"
    }
    
    Write-Host "✓ Environment loaded successfully" -ForegroundColor Green
    if ($Verbose) {
        Write-Host "  - Supabase URL: $supabaseUrl"
        Write-Host "  - Backend URL: $backendUrl"
        Write-Host "  - Webhook Token: $($webhookToken.Substring(0,10))..."
    }
    
    # ========== STEP 2: Fetch Pending Order ==========
    Write-Host "┌─ STEP 2: Finding pending order" -ForegroundColor Cyan
    
    $headers = @{
        apikey = $serviceKey
        Authorization = "Bearer $serviceKey"
    }
    
    if ($OrderId) {
        # Jika OrderId diberikan, ambil order spesifik
        $pendingUrl = "$supabaseUrl/rest/v1/orders?select=id,status,xendit_reference_id,xendit_qr_id,created_at&id=eq.$OrderId"
        Write-Host "  Searching for Order ID: $OrderId"
    } else {
        # Jika tidak ada OrderId, ambil pending order terbaru dengan xendit_reference_id
        $pendingUrl = "$supabaseUrl/rest/v1/orders?select=id,status,xendit_reference_id,xendit_qr_id,created_at&status=eq.pending&xendit_reference_id=not.is.null&order=created_at.desc&limit=1"
        Write-Host "  Searching for latest pending order..."
    }
    
    $pending = Invoke-RestMethod -Uri $pendingUrl -Headers $headers -Method Get
    
    if (-not $pending -or $pending.Count -eq 0) {
        throw "No suitable order found. Please ensure order status is pending and has xendit_reference_id."
    }
    
    $order = if ($pending -is [array]) { $pending[0] } else { $pending }
    
    Write-Host "✓ Order found:" -ForegroundColor Green
    Write-Host "  - Order ID:      $($order.id)"
    Write-Host "  - Status:        $($order.status)"
    Write-Host "  - Reference ID:  $($order.xendit_reference_id)"
    Write-Host "  - QR ID:         $($order.xendit_qr_id)"
    Write-Host "  - Created At:    $($order.created_at)"
    
    # ========== STEP 3: Build Webhook Payload ==========
    Write-Host "┌─ STEP 3: Building webhook payload (Status: $Status)" -ForegroundColor Cyan
    
    $payload = @{
        data = @{
            status = $Status
            payment_status = if ($Status -eq "SUCCEEDED") { "PAID" } else { $Status }
            reference_id = $order.xendit_reference_id
            external_id = $order.xendit_reference_id
            id = $order.xendit_qr_id
            qr_code = @{
                id = $order.xendit_qr_id
                reference_id = $order.xendit_reference_id
                external_id = $order.xendit_reference_id
            }
        }
    } | ConvertTo-Json -Depth 8
    
    Write-Host "✓ Payload created" -ForegroundColor Green
    if ($Verbose) {
        Write-Host "  Payload:"
        Write-Host ($payload | Out-String)
    }
    
    # ========== STEP 4: Trigger Webhook ==========
    Write-Host "┌─ STEP 4: Triggering webhook" -ForegroundColor Cyan
    Write-Host "  POST $backendUrl/api/payments/xendit/webhook"
    
    try {
        $resp = Invoke-WebRequest -Uri "$backendUrl/api/payments/xendit/webhook" `
            -Method Post `
            -ContentType 'application/json' `
            -Body $payload `
            -Headers @{ 'x-callback-token' = $webhookToken }
        
        Write-Host "✓ Webhook triggered successfully" -ForegroundColor Green
        Write-Host "  - Status Code: $([int]$resp.StatusCode)"
        if ($Verbose) {
            Write-Host "  - Response:"
            Write-Host ($resp.Content | ConvertFrom-Json | ConvertTo-Json | Out-String)
        }
    } catch {
        $r = $_.Exception.Response
        if ($r) {
            $sr = New-Object IO.StreamReader($r.GetResponseStream())
            $responseBody = $sr.ReadToEnd()
            Write-Host "✗ Webhook returned error" -ForegroundColor Red
            Write-Host "  - Status Code: $([int]$r.StatusCode.value__)"
            Write-Host "  - Response: $responseBody"
            throw $_
        } else {
            throw $_
        }
    }
    
    # ========== STEP 5: Verify Order Status ==========
    Write-Host "┌─ STEP 5: Verifying order status update" -ForegroundColor Cyan
    Start-Sleep -Milliseconds 500  # Tunggu sebentar untuk database update
    
    $verifyUrl = "$supabaseUrl/rest/v1/orders?select=id,status,paid_at,updated_at&id=eq.$($order.id)"
    $verify = Invoke-RestMethod -Uri $verifyUrl -Headers $headers -Method Get
    
    if (-not $verify -or $verify.Count -eq 0) {
        throw "Could not retrieve updated order"
    }
    
    $v = if ($verify -is [array]) { $verify[0] } else { $verify }
    
    Write-Host "✓ Order status verified:" -ForegroundColor Green
    Write-Host "  - Final Status: $($v.status)"
    Write-Host "  - Paid At:      $($v.paid_at)"
    Write-Host "  - Updated At:   $($v.updated_at)"
    
    # ========== Success Summary ==========
    Write-Host ""
    Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✓ PAYMENT SIMULATION COMPLETED SUCCESSFULLY" -ForegroundColor Green
    Write-Host "═════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Order Details:"
    Write-Host "  Order ID:        $($order.id)"
    Write-Host "  Final Status:    $($v.status)"
    Write-Host "  Payment Time:    $($v.paid_at)"
    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "  1. Check frontend checkout page - should show payment success"
    Write-Host "  2. Check backend logs for 'checkout-flow' and 'xendit-webhook' entries"
    Write-Host "  3. Query payments table: SELECT * FROM payments WHERE order_id = '$($order.id)'"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "‼ ERROR OCCURRED:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:"
    Write-Host "  - Ensure backend is running on port 3100"
    Write-Host "  - Ensure ngrok tunnel is active (if using callback URL)"
    Write-Host "  - Ensure .env.local has all required fields"
    Write-Host "  - Ensure order status is 'pending' and has xendit_reference_id"
    Write-Host ""
    exit 1
}

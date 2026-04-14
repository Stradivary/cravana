# Testing & Webhook Simulation Guide

## Overview

Folder ini berisi tools dan dokumentasi untuk testing Xendit QRIS payment integration termasuk webhook simulation.

## Files

### 1. `test-webhook-payment.ps1` - Main Testing Script

Script PowerShell untuk simulasi Xendit webhook dan verifikasi payment flow end-to-end.

**Lokasi untuk eksekusi:** `backend/` folder

**Cara Penggunaan:**

```powershell
# Navigate ke backend folder
cd D:\RAMOUZ PROJECT\cravana-project\backend

# Copy script dari docs ke backend (jika belum ada)
Copy-Item ..\docs\test-webhook-payment.ps1 .

# Jalankan script
.\test-webhook-payment.ps1
```

**Opsi Parameter:**

| Parameter | Type | Default | Deskripsi |
|-----------|------|---------|-----------|
| `-Status` | string | `SUCCEEDED` | Status webhook: `SUCCEEDED`, `EXPIRED`, `FAILED` |
| `-OrderId` | string | `$null` | UUID order tertentu (jika kosong: ambil pending terbaru) |
| `-Verbose` | switch | `$false` | Tampilkan detail log |

**Contoh Penggunaan:**

```powershell
# Test dengan order pending terbaru (default)
.\test-webhook-payment.ps1

# Test dengan status EXPIRED
.\test-webhook-payment.ps1 -Status EXPIRED

# Test order spesifik
.\test-webhook-payment.ps1 -OrderId "550e8400-e29b-41d4-a716-446655440000"

# Tampilkan detail log
.\test-webhook-payment.ps1 -Verbose
```

**Output Contoh:**

```
┌─ STEP 1: Loading environment variables
✓ Environment loaded successfully
┌─ STEP 2: Finding pending order
✓ Order found:
  - Order ID:      123e4567-e89b-12d3-a456-426614174000
  - Status:        pending
  - Reference ID:  ref_abc123
  - QR ID:         qr_xyz789
┌─ STEP 3: Building webhook payload (Status: SUCCEEDED)
✓ Payload created
┌─ STEP 4: Triggering webhook
✓ Webhook triggered successfully
  - Status Code: 200
┌─ STEP 5: Verifying order status update
✓ Order status verified:
  - Final Status: paid
  - Paid At:      2026-04-14T10:30:45.123Z
═════════════════════════════════════════════════════════
✓ PAYMENT SIMULATION COMPLETED SUCCESSFULLY
═════════════════════════════════════════════════════════
```

## Script Workflow

```
1. Load Environment Variables
   └─> Baca .env.local: SUPABASE_URL, SERVICE_ROLE_KEY, XENDIT_WEBHOOK_TOKEN
   
2. Find Pending Order
   └─> Query database untuk pending order dengan xendit_reference_id
   
3. Build Webhook Payload
   └─> Buat payload JSON sesuai Xendit webhook format
   
4. Trigger Webhook
   └─> POST ke http://127.0.0.1:3100/api/payments/xendit/webhook
   
5. Verify Status
   └─> Query database, pastikan order status berubah dari pending → paid
```

## Prerequisites

Sebelum menjalankan script, pastikan:

✅ **Backend running** di port 3100
```powershell
npm run dev  # Di folder backend
```

✅ **ngrok tunnel active** (jika callback URL menggunakan ngrok)
```powershell
ngrok http 3100
```

✅ **Database migration executed** - Tabel `payments` sudah dibuat
```sql
-- Jalankan di Supabase SQL Editor:
-- Lihat: docs/migrations/2026-04-14_add_payments_table.sql
```

✅ **Environment variables complete** di `backend/.env.local`
```ini
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_WEBHOOK_TOKEN=nTNfP80ros...
XENDIT_CALLBACK_URL=https://buffoon-bounce-angling.ngrok-free.dev/api/payments/xendit/webhook
```

## Troubleshooting

| Error | Solusi |
|-------|--------|
| `.env.local not found` | Pastikan cd ke `backend` folder |
| `Missing required env vars` | Periksa `backend/.env.local` memiliki semua field |
| `No suitable order found` | Buat order baru via checkout, pastikan status pending |
| `Connection refused` | Backend belum running di port 3100 |
| `Webhook returned error 401` | Periksa `XENDIT_WEBHOOK_TOKEN` di `.env.local` |
| `Database update failed` | Cek permissions Supabase Service Role Key |

## Testing Scenarios

### Scenario 1: Successful Payment
```powershell
.\test-webhook-payment.ps1 -Status SUCCEEDED -Verbose
```
Verifikasi di database: `SELECT * FROM orders WHERE status = 'paid' ORDER BY created_at DESC LIMIT 1;`

### Scenario 2: Payment Expired
```powershell
.\test-webhook-payment.ps1 -Status EXPIRED
```
Verifikasi di database: `SELECT * FROM orders WHERE status = 'expired' ORDER BY created_at DESC LIMIT 1;`

### Scenario 3: Specific Order
```powershell
$orderId = "550e8400-e29b-41d4-a716-446655440000"
.\test-webhook-payment.ps1 -OrderId $orderId -Verbose
```

## Logging & Debugging

### Backend Logs
Server akan menampilkan log dengan prefix:
- `checkout-flow` - Order creation & QR generation
- `xendit-webhook` - Webhook processing & status update
- `status_poll` - Polling endpoint calls

### Payment Audit Table
Query untuk melihat webhook history:
```sql
SELECT 
  id,
  order_id,
  provider,
  xendit_event_id,
  provider_status,
  normalized_status,
  processing_result,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
```

### Frontend Debug
Saat webhook di-trigger:
1. Frontend polling harus menangkap status change
2. Halaman checkout akan auto-close atau redirect ke success page
3. Pesan "Pembayaran Berhasil" (atau equivalent) harus tampil

## Integration with CI/CD

Script ini bisa diintegrasikan ke GitHub Actions untuk automated testing:

```yaml
name: Test Payment Webhook
on: [push]
jobs:
  test-payment:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Start Backend
        run: |
          cd backend
          npm install
          npm run dev &
      - name: Wait for Backend
        run: Start-Sleep -Seconds 5
      - name: Test Webhook
        run: |
          cd backend
          ..\docs\test-webhook-payment.ps1
      - name: Verify Payment
        run: |
          # Custom query untuk verifikasi
```

## Notes

- Script menggunakan **Supabase REST API** untuk query & update
- Webhook **authentication** via `x-callback-token` header
- **Order lookup** berdasarkan `xendit_reference_id` matching
- **Status normalization**: SUCCEEDED → paid, EXPIRED → expired, FAILED → failed
- Script **idempotent** - bisa dijalankan berkali-kali di order yang sama

## Related Documentation

- [Payment Flow Architecture](./payments-architecture.md) - Detailed payment system design
- [Xendit Integration](../backend/README.md#xendit-integration) - API configuration
- [Database Schema](./schema.sql) - Payments table structure
- [Migrations](./migrations/) - Database setup scripts

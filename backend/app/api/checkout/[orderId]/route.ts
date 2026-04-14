import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/jwt';
import { getCorsHeaders } from '@/lib/cors';

// ── Helper: JWT ──────────────────────────────────────────────────────
async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const token = req.cookies.get('token')?.value ?? bearerToken;
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    return typeof payload.id === 'string' ? payload.id : null;
  } catch {
    return null;
  }
}

// ── Xendit QR status check ───────────────────────────────────────────
type XenditPayment = { status: string };
type XenditQRDetail = { id: string; status: string; payments?: XenditPayment[] };

async function checkXenditQR(qrId: string): Promise<{ paid: boolean; expired: boolean }> {
  const secretKey = process.env.XENDIT_SECRET_KEY ?? '';
  if (!secretKey) return { paid: false, expired: false };

  try {
    const basicAuth = Buffer.from(secretKey + ':').toString('base64');
    const res = await fetch(`https://api.xendit.co/qr_codes/${qrId}`, {
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    if (!res.ok) return { paid: false, expired: false };

    const data = (await res.json()) as XenditQRDetail;
    const paid = data.payments?.some((p) => p.status === 'SUCCEEDED') ?? false;
    const expired = data.status === 'INACTIVE' && !paid;
    return { paid, expired };
  } catch {
    return { paid: false, expired: false };
  }
}

// ── OPTIONS ──────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

// ── GET /api/checkout/[orderId] ──────────────────────────────────────
// Mengecek status pembayaran order. Digunakan frontend untuk polling.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const flowId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  const userId = await getUserId(req);

  console.log('[checkout-flow] status_poll.request_received', { flowId, hasUserId: Boolean(userId) });

  if (!userId) {
    console.warn('[checkout-flow] status_poll.unauthorized', { flowId });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { orderId } = await params;
  console.log('[checkout-flow] status_poll.order_requested', { flowId, userId, orderId });

  const { data: order, error } = await supabaseServer
    .from('orders')
    .select('id, status, total_amount, paid_at, xendit_qr_id, xendit_expires_at')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error ?? !order) {
    console.warn('[checkout-flow] status_poll.order_not_found', {
      flowId,
      userId,
      orderId,
      error: error?.message ?? null,
    });
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }

  let status: string = order.status;
  let paidAt: string | null = order.paid_at ?? null;

  console.log('[checkout-flow] status_poll.current_state', {
    flowId,
    orderId,
    status,
    hasQrId: Boolean(order.xendit_qr_id),
    expiresAt: order.xendit_expires_at,
  });

  if (status === 'pending' && order.xendit_qr_id) {
    // Cek apakah sudah melewati batas waktu
    const expiresAt = order.xendit_expires_at ? new Date(order.xendit_expires_at as string) : null;
    if (expiresAt && expiresAt < new Date()) {
      // Expired berdasarkan waktu lokal
      await supabaseServer.from('orders').update({ status: 'expired' }).eq('id', orderId);
      status = 'expired';
      console.log('[checkout-flow] status_poll.marked_expired_local', { flowId, orderId });
    } else {
      // Cek status ke Xendit
      const xenditResult = await checkXenditQR(order.xendit_qr_id as string);
      console.log('[checkout-flow] status_poll.xendit_checked', {
        flowId,
        orderId,
        qrId: order.xendit_qr_id,
        paid: xenditResult.paid,
        expired: xenditResult.expired,
      });
      if (xenditResult.paid) {
        const now = new Date().toISOString();
        await supabaseServer
          .from('orders')
          .update({ status: 'paid', paid_at: now })
          .eq('id', orderId);
        status = 'paid';
        paidAt = now;
        console.log('[checkout-flow] status_poll.marked_paid', { flowId, orderId, paidAt: now });
      } else if (xenditResult.expired) {
        await supabaseServer.from('orders').update({ status: 'expired' }).eq('id', orderId);
        status = 'expired';
        console.log('[checkout-flow] status_poll.marked_expired_xendit', { flowId, orderId });
      }
    }
  }

  console.log('[checkout-flow] status_poll.response_ready', { flowId, orderId, status, paidAt });

  return NextResponse.json(
    { orderId: order.id, status, totalAmount: order.total_amount, paidAt },
    { status: 200, headers: corsHeaders }
  );
}

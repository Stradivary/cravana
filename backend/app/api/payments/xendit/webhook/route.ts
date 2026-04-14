import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

type WebhookStatus = 'paid' | 'expired' | 'failed' | null;
type PaymentResult =
  | 'processed'
  | 'ignored_status'
  | 'ignored_order_not_found'
  | 'ignored_already_paid'
  | 'update_failed';

type XenditWebhookBody = {
  id?: string;
  status?: string;
  payment_status?: string;
  amount?: number;
  currency?: string;
  external_id?: string;
  reference_id?: string;
  qr_code?: {
    id?: string;
    external_id?: string;
    reference_id?: string;
  };
  data?: {
    id?: string;
    status?: string;
    payment_status?: string;
    amount?: number;
    currency?: string;
    external_id?: string;
    reference_id?: string;
    qr_code?: {
      id?: string;
      external_id?: string;
      reference_id?: string;
    };
  };
};

function normalizeStatus(rawStatus?: string): WebhookStatus {
  const status = rawStatus?.toUpperCase().trim();
  if (!status) return null;

  if (status === 'SUCCEEDED' || status === 'PAID' || status === 'COMPLETED') {
    return 'paid';
  }
  if (status === 'EXPIRED') {
    return 'expired';
  }
  if (status === 'FAILED' || status === 'CANCELLED') {
    return 'failed';
  }

  return null;
}

function pickIdentifiers(body: XenditWebhookBody) {
  const data = body.data ?? {};

  const referenceId =
    data.reference_id ??
    data.external_id ??
    data.qr_code?.reference_id ??
    data.qr_code?.external_id ??
    body.reference_id ??
    body.external_id ??
    body.qr_code?.reference_id ??
    body.qr_code?.external_id ??
    null;

  const qrId =
    data.qr_code?.id ??
    data.id ??
    body.qr_code?.id ??
    body.id ??
    null;

  const normalized = normalizeStatus(data.status ?? data.payment_status ?? body.status ?? body.payment_status);

  return { referenceId, qrId, normalized };
}

async function findOrderIdByXendit(referenceId: string | null, qrId: string | null): Promise<string | null> {
  if (referenceId) {
    const byRef = await supabaseServer
      .from('orders')
      .select('id')
      .eq('xendit_reference_id', referenceId)
      .maybeSingle();

    if (byRef.data?.id) return byRef.data.id as string;

    const byPrimaryId = await supabaseServer
      .from('orders')
      .select('id')
      .eq('id', referenceId)
      .maybeSingle();

    if (byPrimaryId.data?.id) return byPrimaryId.data.id as string;
  }

  if (qrId) {
    const byQr = await supabaseServer
      .from('orders')
      .select('id')
      .eq('xendit_qr_id', qrId)
      .maybeSingle();

    if (byQr.data?.id) return byQr.data.id as string;
  }

  return null;
}

async function insertPaymentLog(params: {
  body: XenditWebhookBody;
  requestId: string | null;
  eventId: string | null;
  referenceId: string | null;
  qrId: string | null;
  normalized: WebhookStatus;
  orderId: string | null;
  result: PaymentResult;
  note?: string;
}) {
  const { body, requestId, eventId, referenceId, qrId, normalized, orderId, result, note } = params;

  const payload = {
    order_id: orderId,
    provider: 'xendit',
    payment_method: 'qris',
    xendit_event_id: eventId,
    xendit_reference_id: referenceId,
    xendit_qr_id: qrId,
    provider_status: (body.data?.status ?? body.data?.payment_status ?? body.status ?? body.payment_status ?? null)?.toString() ?? null,
    normalized_status: normalized,
    amount: body.data?.amount ?? body.amount ?? null,
    currency: body.data?.currency ?? body.currency ?? 'IDR',
    processing_result: result,
    note: note ?? null,
    request_id: requestId,
    raw_payload: body,
  };

  const { error } = await supabaseServer.from('payments').insert(payload);
  if (error) {
    console.error('[xendit-webhook] payment log insert failed', {
      requestId,
      eventId,
      result,
      error: error.message,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

// POST /api/payments/xendit/webhook
// Endpoint callback dari Xendit untuk sinkronisasi status pembayaran.
export async function POST(req: NextRequest) {
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
  const callbackToken = req.headers.get('x-callback-token');
  const requestId = req.headers.get('x-request-id');
  const eventId = req.headers.get('webhook-id') ?? req.headers.get('x-webhook-id');

  console.log('[xendit-webhook] incoming', {
    hasCallbackToken: Boolean(callbackToken),
    requestId,
    eventId,
  });

  if (!webhookToken) {
    return NextResponse.json({ error: 'Webhook token belum dikonfigurasi' }, { status: 500 });
  }

  if (!callbackToken || callbackToken !== webhookToken) {
    console.warn('[xendit-webhook] unauthorized callback', {
      hasCallbackToken: Boolean(callbackToken),
      requestId,
      eventId,
    });
    return NextResponse.json({ error: 'Unauthorized webhook callback' }, { status: 401 });
  }

  let body: XenditWebhookBody;
  try {
    body = (await req.json()) as XenditWebhookBody;
  } catch {
    console.warn('[xendit-webhook] invalid json payload', { requestId, eventId });
    return NextResponse.json({ error: 'Payload webhook tidak valid' }, { status: 400 });
  }

  console.log('[xendit-webhook] payload', {
    requestId,
    eventId,
    id: body.id,
    status: body.status,
    payment_status: body.payment_status,
    external_id: body.external_id,
    reference_id: body.reference_id,
    data_id: body.data?.id,
    data_status: body.data?.status,
    data_payment_status: body.data?.payment_status,
    data_external_id: body.data?.external_id,
    data_reference_id: body.data?.reference_id,
  });

  const { referenceId, qrId, normalized } = pickIdentifiers(body);
  console.log('[xendit-webhook] normalized', {
    requestId,
    eventId,
    referenceId,
    qrId,
    normalized,
  });

  if (!normalized) {
    await insertPaymentLog({
      body,
      requestId,
      eventId,
      referenceId,
      qrId,
      normalized,
      orderId: null,
      result: 'ignored_status',
      note: 'Status tidak dikenali atau tidak diproses',
    });
    return NextResponse.json({ message: 'Status webhook diabaikan' }, { status: 200 });
  }

  const orderId = await findOrderIdByXendit(referenceId, qrId);
  console.log('[xendit-webhook] order lookup', {
    requestId,
    eventId,
    orderId,
  });

  console.log('[checkout-flow] webhook.event_mapped', {
    requestId,
    eventId,
    referenceId,
    qrId,
    orderId,
    normalized,
  });

  if (!orderId) {
    await insertPaymentLog({
      body,
      requestId,
      eventId,
      referenceId,
      qrId,
      normalized,
      orderId: null,
      result: 'ignored_order_not_found',
      note: 'Order tidak ditemukan dari reference/qr id',
    });
    return NextResponse.json({ message: 'Order tidak ditemukan, diabaikan' }, { status: 200 });
  }

  const { data: currentOrder } = await supabaseServer
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle();

  if (!currentOrder) {
    await insertPaymentLog({
      body,
      requestId,
      eventId,
      referenceId,
      qrId,
      normalized,
      orderId,
      result: 'ignored_order_not_found',
      note: 'Order tidak ditemukan saat validasi status',
    });
    return NextResponse.json({ message: 'Order tidak ditemukan, diabaikan' }, { status: 200 });
  }

  // Idempotent: jangan downgrade order yang sudah paid
  if (currentOrder.status === 'paid') {
    await insertPaymentLog({
      body,
      requestId,
      eventId,
      referenceId,
      qrId,
      normalized,
      orderId,
      result: 'ignored_already_paid',
      note: 'Order sudah paid (idempotent)',
    });
    return NextResponse.json({ message: 'Order sudah paid, diabaikan' }, { status: 200 });
  }

  const updatePayload: Record<string, string | null> = {
    status: normalized,
  };

  if (normalized === 'paid') {
    updatePayload.paid_at = new Date().toISOString();
  }

  const { error: updateError } = await supabaseServer
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId);

  if (updateError) {
    await insertPaymentLog({
      body,
      requestId,
      eventId,
      referenceId,
      qrId,
      normalized,
      orderId,
      result: 'update_failed',
      note: updateError.message,
    });
    console.error('[xendit-webhook] update failed', {
      requestId,
      eventId,
      orderId,
      normalized,
      error: updateError.message,
    });
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log('[xendit-webhook] processed', {
    requestId,
    eventId,
    orderId,
    normalized,
  });

  await insertPaymentLog({
    body,
    requestId,
    eventId,
    referenceId,
    qrId,
    normalized,
    orderId,
    result: 'processed',
  });

  return NextResponse.json({ message: 'Webhook diproses', orderId, status: normalized }, { status: 200 });
}

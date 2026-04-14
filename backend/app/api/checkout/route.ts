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

// ── Types ────────────────────────────────────────────────────────────
type ProductJoin = {
  id: string;
  name: string;
  image_url: string;
  stock: number;
  is_active: boolean;
};

type CartItemRow = {
  id: string;
  product_id: string;
  quantity: number;
  price_snapshot: number;
  products: ProductJoin[] | ProductJoin | null;
};

type XenditQRResponse = {
  id: string;
  reference_id: string;
  external_id?: string;
  qr_string: string;
  expires_at: string;
  status: string;
};

type XenditErrorResponse = {
  error_code?: string;
  message?: string;
  errors?: Array<{ message?: string }>;
};

const MIN_QRIS_AMOUNT = Number(process.env.XENDIT_MIN_QR_AMOUNT ?? 1500);

// ── Xendit helper ────────────────────────────────────────────────────
function resolveXenditCallbackUrl(req: NextRequest): string {
  const explicit = process.env.XENDIT_CALLBACK_URL?.trim();
  if (explicit) return explicit;

  return `${req.nextUrl.origin}/api/payments/xendit/webhook`;
}

async function createXenditQR(
  referenceId: string,
  amount: number,
  callbackUrl: string
): Promise<XenditQRResponse> {
  const secretKey = process.env.XENDIT_SECRET_KEY ?? '';
  if (!secretKey) throw new Error('Konfigurasi payment gateway belum tersedia');

  console.log('[checkout-flow] xendit.create_qr.request', {
    referenceId,
    externalId: referenceId,
    amount,
    currency: 'IDR',
    callbackUrl,
  });

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const basicAuth = Buffer.from(secretKey + ':').toString('base64');

  const res = await fetch('https://api.xendit.co/qr_codes', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference_id: referenceId,
      external_id: referenceId,
      type: 'DYNAMIC',
      currency: 'IDR',
      amount,
      expires_at: expiresAt,
      callback_url: callbackUrl,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as XenditErrorResponse;
    const detailedErrors = (err.errors ?? [])
      .map((entry) => entry.message)
      .filter((msg): msg is string => Boolean(msg?.trim()));
    const detailsText = detailedErrors.length > 0 ? detailedErrors.join(' | ') : null;
    const finalMessage = [err.message ?? 'Gagal membuat QR pembayaran di Xendit', detailsText]
      .filter(Boolean)
      .join(' - ');

    console.error('[checkout-flow] xendit.create_qr.failed', {
      referenceId,
      amount,
      status: res.status,
      errorCode: err.error_code ?? null,
      message: err.message ?? null,
      errors: detailedErrors,
    });
    throw new Error(finalMessage);
  }

  const qr = await res.json() as XenditQRResponse;
  console.log('[checkout-flow] xendit.create_qr.success', {
    referenceId,
    qrId: qr.id,
    qrStatus: qr.status,
    expiresAt: qr.expires_at,
  });

  return qr;
}

function resolveProduct(products: CartItemRow['products']): ProductJoin | null {
  if (!products) return null;
  return Array.isArray(products) ? (products[0] ?? null) : products;
}

// ── OPTIONS ──────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

// ── POST /api/checkout ───────────────────────────────────────────────
// Membuat order dari cart user + generate QRIS Xendit.
// Body: { buyerName, buyerPhone, buyerAddress, cartItemIds? }
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const flowId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  const callbackUrl = resolveXenditCallbackUrl(req);
  const userId = await getUserId(req);

  console.log('[checkout-flow] checkout.request_received', { flowId, hasUserId: Boolean(userId) });

  if (!userId) {
    console.warn('[checkout-flow] checkout.unauthorized', { flowId });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  let body: { buyerName?: string; buyerPhone?: string; buyerAddress?: string; cartItemIds?: string[] };
  try {
    body = await req.json();
  } catch {
    console.warn('[checkout-flow] checkout.invalid_body', { flowId, userId });
    return NextResponse.json({ error: 'Request body tidak valid' }, { status: 400, headers: corsHeaders });
  }

  const { buyerName, buyerPhone, buyerAddress, cartItemIds } = body;
  if (!buyerName?.trim())
    return NextResponse.json({ error: 'Nama pembeli wajib diisi' }, { status: 400, headers: corsHeaders });
  if (!buyerPhone?.trim())
    return NextResponse.json({ error: 'Nomor HP wajib diisi' }, { status: 400, headers: corsHeaders });
  if (!buyerAddress?.trim())
    return NextResponse.json({ error: 'Alamat wajib diisi' }, { status: 400, headers: corsHeaders });
  if (cartItemIds !== undefined && (!Array.isArray(cartItemIds) || cartItemIds.some((id) => typeof id !== 'string'))) {
    console.warn('[checkout-flow] checkout.invalid_cart_item_ids', { flowId, userId });
    return NextResponse.json({ error: 'cartItemIds tidak valid' }, { status: 400, headers: corsHeaders });
  }

  // Ambil cart
  const { data: cartRaw, error: cartError } = await supabaseServer
    .from('cart_items')
    .select('id, product_id, quantity, price_snapshot, products (id, name, image_url, stock, is_active)')
    .eq('user_id', userId);

  if (cartError)
    console.error('[checkout-flow] checkout.cart_query_failed', { flowId, userId, error: cartError.message });

  if (cartError)
    return NextResponse.json({ error: cartError.message }, { status: 500, headers: corsHeaders });

  const allCartItems = (cartRaw as unknown as CartItemRow[]) ?? [];
  if (allCartItems.length === 0)
    console.warn('[checkout-flow] checkout.empty_cart', { flowId, userId });

  if (allCartItems.length === 0)
    return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400, headers: corsHeaders });

  const selectedIdSet = cartItemIds && cartItemIds.length > 0 ? new Set(cartItemIds) : null;
  const cartItems = selectedIdSet
    ? allCartItems.filter((item) => selectedIdSet.has(item.id))
    : allCartItems;

  if (cartItems.length === 0) {
    console.warn('[checkout-flow] checkout.selected_items_empty', { flowId, userId, selectedCount: cartItemIds?.length ?? 0 });
    return NextResponse.json({ error: 'Tidak ada item yang dipilih untuk checkout' }, { status: 400, headers: corsHeaders });
  }

  const totalAmount = cartItems.reduce((sum, i) => sum + i.price_snapshot * i.quantity, 0);
  console.log('[checkout-flow] checkout.cart_ready', {
    flowId,
    userId,
    totalAmount,
    allCartCount: allCartItems.length,
    selectedCartCount: cartItems.length,
  });

  if (totalAmount < MIN_QRIS_AMOUNT) {
    console.warn('[checkout-flow] checkout.amount_below_minimum', {
      flowId,
      userId,
      totalAmount,
      minimumAmount: MIN_QRIS_AMOUNT,
    });
    return NextResponse.json(
      {
        error: `Total checkout terlalu kecil untuk QRIS. Minimal Rp${MIN_QRIS_AMOUNT.toLocaleString('id-ID')}.`,
      },
      { status: 400, headers: corsHeaders }
    );
  }

  // Buat order
  const { data: order, error: orderError } = await supabaseServer
    .from('orders')
    .insert({
      user_id: userId,
      buyer_name: buyerName.trim(),
      buyer_phone: buyerPhone.trim(),
      buyer_address: buyerAddress.trim(),
      total_amount: totalAmount,
      status: 'pending',
      payment_method: 'qris',
    })
    .select()
    .single();

  if (orderError ?? !order)
    console.error('[checkout-flow] checkout.order_create_failed', {
      flowId,
      userId,
      totalAmount,
      error: orderError?.message ?? 'Order null',
    });

  if (orderError ?? !order)
    return NextResponse.json(
      { error: orderError?.message ?? 'Gagal membuat pesanan' },
      { status: 500, headers: corsHeaders }
    );

  console.log('[checkout-flow] checkout.order_created', {
    flowId,
    userId,
    orderId: order.id,
    totalAmount,
    itemCount: cartItems.length,
  });

  // Buat order_items
  const orderItemsPayload = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: resolveProduct(item.products)?.name ?? 'Produk',
    quantity: item.quantity,
    unit_price: item.price_snapshot,
    subtotal: item.price_snapshot * item.quantity,
  }));

  const { error: itemsError } = await supabaseServer.from('order_items').insert(orderItemsPayload);
  if (itemsError) {
    console.error('[checkout-flow] checkout.order_items_insert_failed', {
      flowId,
      orderId: order.id,
      error: itemsError.message,
    });
    await supabaseServer.from('orders').delete().eq('id', order.id);
    console.warn('[checkout-flow] checkout.order_rolled_back', { flowId, orderId: order.id });
    return NextResponse.json({ error: itemsError.message }, { status: 500, headers: corsHeaders });
  }

  console.log('[checkout-flow] checkout.order_items_inserted', {
    flowId,
    orderId: order.id,
    itemCount: orderItemsPayload.length,
  });

  // Buat Xendit QR
  let qrData: XenditQRResponse;
  try {
    console.log('[checkout-flow] checkout.qr_generation_started', {
      flowId,
      orderId: order.id,
      referenceId: order.id,
      totalAmount,
      callbackUrl,
    });
    qrData = await createXenditQR(order.id, totalAmount, callbackUrl);
    await supabaseServer
      .from('orders')
      .update({
        xendit_reference_id: qrData.reference_id,
        xendit_qr_id: qrData.id,
        xendit_qr_string: qrData.qr_string,
        xendit_expires_at: qrData.expires_at,
      })
      .eq('id', order.id);

    console.log('[checkout-flow] checkout.qr_attached_to_order', {
      flowId,
      orderId: order.id,
      referenceId: qrData.reference_id,
      qrId: qrData.id,
      expiresAt: qrData.expires_at,
    });
  } catch (xenditErr) {
    const xenditMessage = xenditErr instanceof Error ? xenditErr.message : 'Unknown Xendit error';
    console.error('[checkout-flow] checkout.qr_generation_failed', {
      flowId,
      orderId: order.id,
      message: xenditMessage,
    });

    await supabaseServer
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', order.id);

    console.warn('[checkout-flow] checkout.order_marked_failed', {
      flowId,
      orderId: order.id,
    });

    return NextResponse.json(
      { error: `Gagal membuat QRIS di Xendit: ${xenditMessage}` },
      { status: 502, headers: corsHeaders }
    );
  }

  // Hapus hanya item cart yang berhasil di-checkout
  await supabaseServer.from('cart_items').delete().in('id', cartItems.map((item) => item.id));

  console.log('[checkout-flow] checkout.cart_items_cleared', {
    flowId,
    orderId: order.id,
    clearedCount: cartItems.length,
  });

  console.log('[checkout-flow] checkout.response_ready', {
    flowId,
    orderId: order.id,
    status: 'pending',
    hasQrString: Boolean(qrData.qr_string),
  });

  return NextResponse.json(
    {
      order: {
        orderId: order.id,
        status: 'pending',
        totalAmount,
        buyerName: order.buyer_name,
        buyerPhone: order.buyer_phone,
        buyerAddress: order.buyer_address,
        qrString: qrData.qr_string,
        expiresAt: qrData.expires_at,
        paidAt: null,
        createdAt: order.created_at as string,
        items: orderItemsPayload.map((item, i) => ({
          productId: item.product_id,
          productName: item.product_name,
          imageUrl: resolveProduct(cartItems[i]?.products)?.image_url ?? null,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.subtotal,
        })),
      },
    },
    { status: 201, headers: corsHeaders }
  );
}

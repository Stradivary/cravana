import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/jwt';
import { getCorsHeaders } from '@/lib/cors';

// ── Helper: ekstrak & verifikasi JWT ────────────────────────────────
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

// ── OPTIONS ──────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

// ── PUT /api/cart/[itemId] ───────────────────────────────────────────
// Mengubah quantity item tertentu di cart.
// Body: { quantity: number }
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { itemId } = await context.params;

  let body: { quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body tidak valid' }, { status: 400, headers: corsHeaders });
  }

  const { quantity } = body;
  if (typeof quantity !== 'number' || quantity < 1) {
    return NextResponse.json(
      { error: 'quantity harus berupa bilangan positif' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Pastikan item milik user ini
  const { data: item, error: fetchError } = await supabaseServer
    .from('cart_items')
    .select('id, product_id')
    .eq('id', itemId)
    .eq('user_id', userId)
    .maybeSingle();

  if (fetchError || !item) {
    return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }

  // Validasi stok produk
  const { data: product, error: productError } = await supabaseServer
    .from('products')
    .select('stock')
    .eq('id', item.product_id)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }
  if (quantity > product.stock) {
    return NextResponse.json(
      { error: `Stok tidak mencukupi. Tersedia: ${product.stock}` },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data: updated, error: updateError } = await supabaseServer
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ item: updated }, { status: 200, headers: corsHeaders });
}

// ── DELETE /api/cart/[itemId] ────────────────────────────────────────
// Menghapus satu item dari cart berdasarkan itemId.
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { itemId } = await context.params;

  // Pastikan item milik user ini sebelum hapus
  const { data: item } = await supabaseServer
    .from('cart_items')
    .select('id')
    .eq('id', itemId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!item) {
    return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }

  const { error } = await supabaseServer
    .from('cart_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ message: 'Item berhasil dihapus dari cart' }, { status: 200, headers: corsHeaders });
}

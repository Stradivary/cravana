import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/jwt';
import { getCorsHeaders } from '@/lib/cors';
import { applyTestDiscount } from '@/lib/pricing';

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

// ── Types ────────────────────────────────────────────────────────────
type ProductJoin = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  stock: number;
};

type CartItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price_snapshot: number;
  created_at: string;
  updated_at: string;
  // Supabase returns related rows as array for foreign-key joins
  products: ProductJoin[] | ProductJoin | null;
};

// ── OPTIONS ──────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

// ── GET /api/cart ────────────────────────────────────────────────────
// Mengambil semua item cart milik user yang sedang login.
export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { data, error } = await supabaseServer
    .from('cart_items')
    .select(`
      id,
      user_id,
      product_id,
      quantity,
      price_snapshot,
      created_at,
      updated_at,
      products (
        id,
        slug,
        name,
        summary,
        image_url,
        original_price,
        discounted_price,
        stock
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  const items = (data as unknown as CartItemRow[] ?? []).map((row) => {
    const p = Array.isArray(row.products) ? row.products[0] ?? null : row.products;
    return {
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      priceSnapshot: row.price_snapshot,
      subtotal: row.price_snapshot * row.quantity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      product: p
        ? {
            id: p.id,
            slug: p.slug,
            name: p.name,
            summary: p.summary,
            imageUrl: p.image_url,
            originalPrice: p.original_price,
            discountedPrice: p.discounted_price,
            stock: p.stock,
          }
        : null,
    };
  });

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return NextResponse.json({ items, total }, { status: 200, headers: corsHeaders });
}

// ── POST /api/cart ───────────────────────────────────────────────────
// Menambahkan produk ke cart (upsert: jika sudah ada, tambah quantity).
// Body: { productId: string, quantity?: number }
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  let body: { productId?: string; quantity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body tidak valid' }, { status: 400, headers: corsHeaders });
  }

  const { productId, quantity = 1 } = body;

  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'productId wajib diisi' }, { status: 400, headers: corsHeaders });
  }
  if (typeof quantity !== 'number' || quantity < 1) {
    return NextResponse.json({ error: 'quantity harus berupa bilangan positif' }, { status: 400, headers: corsHeaders });
  }

  // Ambil harga terkini produk sebagai price_snapshot
  const { data: product, error: productError } = await supabaseServer
    .from('products')
    .select('id, discounted_price, stock, is_active')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }
  if (!product.is_active) {
    return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 400, headers: corsHeaders });
  }
  if (product.stock < quantity) {
    return NextResponse.json(
      { error: `Stok tidak mencukupi. Tersedia: ${product.stock}` },
      { status: 400, headers: corsHeaders }
    );
  }

  const discountedSnapshotPrice = applyTestDiscount(product.discounted_price);

  // Cek apakah produk sudah ada di cart user
  const { data: existing } = await supabaseServer
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  let result;
  if (existing) {
    // Update quantity
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      return NextResponse.json(
        { error: `Stok tidak mencukupi. Tersedia: ${product.stock}` },
        { status: 400, headers: corsHeaders }
      );
    }
    result = await supabaseServer
      .from('cart_items')
      .update({ quantity: newQty, price_snapshot: discountedSnapshotPrice })
      .eq('id', existing.id)
      .select()
      .single();
  } else {
    // Insert baru
    result = await supabaseServer
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
        price_snapshot: discountedSnapshotPrice,
      })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ item: result.data }, { status: 200, headers: corsHeaders });
}

// ── DELETE /api/cart ─────────────────────────────────────────────────
// Menghapus semua item cart milik user (clear cart).
export async function DELETE(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { error } = await supabaseServer
    .from('cart_items')
    .delete()
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ message: 'Cart berhasil dikosongkan' }, { status: 200, headers: corsHeaders });
}

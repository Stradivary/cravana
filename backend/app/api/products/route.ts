import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCorsHeaders } from '@/lib/cors';
import { applyTestDiscount } from '@/lib/pricing';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  points: number;
  stock: number;
  is_active: boolean;
  created_at: string | null;
};

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  const { data: products, error } = await supabaseServer
    .from('products')
    .select('id, slug, name, summary, image_url, original_price, discounted_price, points, stock, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      products: (products as ProductRow[] | null ?? []).map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        summary: product.summary,
        imageUrl: product.image_url,
        originalPrice: product.original_price,
        discountedPrice: applyTestDiscount(product.discounted_price),
        points: product.points,
        stock: product.stock,
        isActive: product.is_active,
        createdAt: product.created_at,
      })),
    },
    { status: 200, headers: corsHeaders }
  );
}

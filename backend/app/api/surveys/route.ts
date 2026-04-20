import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCorsHeaders } from '@/lib/cors';

type SurveyRow = {
  id: string;
  name: string;
  review: string;
  is_visible: boolean;
  is_active: boolean;
  created_at: string;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const parseNonNegativeInt = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
};

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const url = new URL(req.url);

  const limit = Math.min(parsePositiveInt(url.searchParams.get('limit'), 5), 50);
  const offset = parseNonNegativeInt(url.searchParams.get('offset'), 0);

  const { data, error, count } = await supabaseServer
    .from('surveys')
    .select('id, name, review, is_visible, is_active, created_at', { count: 'exact' })
    .eq('is_visible', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  const rows = (data as SurveyRow[] | null) ?? [];
  const total = count ?? 0;

  return NextResponse.json(
    {
      reviews: rows.map((row) => ({
        id: row.id,
        name: row.name,
        review: row.review,
        createdAt: row.created_at,
      })),
      pagination: {
        limit,
        offset,
        count: rows.length,
        total,
        hasMore: offset + rows.length < total,
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const body = await req.json();

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const review = typeof body?.review === 'string' ? body.review.trim() : '';

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json(
      { error: 'Nama harus berisi 2 sampai 80 karakter' },
      { status: 400, headers: corsHeaders }
    );
  }

  if (review.length < 10 || review.length > 280) {
    return NextResponse.json(
      { error: 'Review harus berisi 10 sampai 280 karakter' },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabaseServer
    .from('surveys')
    .insert({
      name,
      review,
      is_visible: true,
      is_active: true,
    })
    .select('id, name, review, is_visible, is_active, created_at')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Gagal menyimpan review' },
      { status: 500, headers: corsHeaders }
    );
  }

  const row = data as SurveyRow;

  return NextResponse.json(
    {
      message: 'Review berhasil disimpan',
      review: {
        id: row.id,
        name: row.name,
        review: row.review,
        isVisible: row.is_visible,
        isActive: row.is_active,
        createdAt: row.created_at,
      },
    },
    { status: 201, headers: corsHeaders }
  );
}

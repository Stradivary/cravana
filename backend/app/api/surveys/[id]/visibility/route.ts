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
  updated_at: string;
};

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const { id } = await context.params;
  const body = await req.json();

  const payload: { is_visible?: boolean; is_active?: boolean } = {};

  if (typeof body?.isVisible === 'boolean') payload.is_visible = body.isVisible;
  if (typeof body?.isActive === 'boolean') payload.is_active = body.isActive;

  if (Object.keys(payload).length === 0) {
    return NextResponse.json(
      { error: 'isVisible atau isActive wajib dikirim' },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabaseServer
    .from('surveys')
    .update(payload)
    .eq('id', id)
    .select('id, name, review, is_visible, is_active, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Gagal mengubah visibilitas review' },
      { status: 500, headers: corsHeaders }
    );
  }

  const row = data as SurveyRow;

  return NextResponse.json(
    {
      message: 'Review berhasil diperbarui',
      review: {
        id: row.id,
        name: row.name,
        review: row.review,
        isVisible: row.is_visible,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

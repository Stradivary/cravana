import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const { id } = await context.params;

  const { data: user, error } = await supabaseServer
    .from('users')
    .update({ approved: true })
    .eq('id', id)
    .select('id, name, email, phone_number, approved, created_at')
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: error?.message || 'Gagal approve user' },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      message: 'User berhasil di-approve',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone_number ?? null,
        approved: Boolean(user.approved),
        createdAt: user.created_at ?? null,
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

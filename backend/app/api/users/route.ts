import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  let { data: users, error } = await supabaseServer
    .from('users')
    .select('id, name, role, gender, address, email, phone_number, approved, created_at')
    .order('created_at', { ascending: false });

  const isMissingRoleColumn = Boolean(error) && /role/i.test(error?.message ?? '');

  if (isMissingRoleColumn) {
    const fallbackResult = await supabaseServer
      .from('users')
      .select('id, name, gender, address, email, phone_number, approved, created_at')
      .order('created_at', { ascending: false });

    users = (fallbackResult.data ?? []).map((user) => ({ ...user, role: null }));
    error = fallbackResult.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      users: (users ?? []).map((user) => ({
        id: user.id,
        name: user.name,
        role: user.role ?? null,
        gender: user.gender,
        address: user.address,
        email: user.email,
        phoneNumber: user.phone_number ?? null,
        approved: Boolean(user.approved),
        createdAt: user.created_at ?? null,
      })),
    },
    { status: 200, headers: corsHeaders }
  );
}

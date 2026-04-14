import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { verifyToken } from '@/lib/jwt';
import { getCorsHeaders } from '@/lib/cors';

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  gender: string | null;
  address: string | null;
  phone_number: string | null;
  file_url: string | null;
  approved: boolean | null;
  provider: string | null;
  created_at: string | null;
  role?: string | null;
};

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const authorizationHeader = req.headers.get('authorization');
  const bearerToken = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice(7).trim()
    : null;
  const cookieToken = req.cookies.get('token')?.value;
  const token = cookieToken || bearerToken;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: corsHeaders }
    );
  }

  let payload: Awaited<ReturnType<typeof verifyToken>>;
  try {
    payload = await verifyToken(token);
  } catch {
    return NextResponse.json(
      { error: 'Token tidak valid atau kadaluarsa' },
      { status: 401, headers: corsHeaders }
    );
  }

  const userId = typeof payload.id === 'string' ? payload.id : null;
  if (!userId) {
    return NextResponse.json(
      { error: 'Payload token tidak valid' },
      { status: 401, headers: corsHeaders }
    );
  }

  let { data: user, error } = await supabaseServer
    .from('users')
    .select('id, name, role, email, gender, address, phone_number, file_url, approved, provider, created_at')
    .eq('id', userId)
    .single();

  const isMissingRoleColumn = Boolean(error) && /role/i.test(error?.message ?? '');

  if (isMissingRoleColumn) {
    const fallbackResult = await supabaseServer
      .from('users')
      .select('id, name, email, gender, address, phone_number, file_url, approved, provider, created_at')
      .eq('id', userId)
      .single();

    user = fallbackResult.data ? { ...fallbackResult.data, role: null } : null;
    error = fallbackResult.error;
  }

  if (error?.code === 'PGRST116' || !user) {
    return NextResponse.json(
      { error: 'User tidak ditemukan' },
      { status: 404, headers: corsHeaders }
    );
  }

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }

  const profile = user as ProfileRow;

  return NextResponse.json(
    {
      profile: {
        id: profile.id,
        name: profile.name,
        role: profile.role ?? null,
        email: profile.email,
        gender: profile.gender,
        address: profile.address,
        phoneNumber: profile.phone_number,
        fileUrl: profile.file_url,
        approved: Boolean(profile.approved),
        provider: profile.provider,
        createdAt: profile.created_at,
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

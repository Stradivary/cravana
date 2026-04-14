import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serialize } from 'cookie';
import { supabaseServer } from '@/lib/supabase-server';
import { generateToken } from '@/lib/jwt';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

/**
 * POST /api/auth/google/verify
 * Dipanggil frontend setelah OAuth Google selesai.
 * Frontend mengirim Supabase access_token, backend memverifikasi,
 * sinkronisasi user ke tabel users, lalu issue custom JWT dalam cookie.
 *
 * Body: { access_token: string }
 * Response: { message, user }
 */
export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  let access_token: string;
  try {
    const body = await req.json();
    access_token = body.access_token;
  } catch {
    return NextResponse.json(
      { error: 'Request body tidak valid' },
      { status: 400, headers: corsHeaders }
    );
  }

  if (!access_token) {
    return NextResponse.json(
      { error: 'access_token wajib diisi' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Verifikasi access_token Supabase untuk mendapatkan data user OAuth
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Konfigurasi Supabase tidak lengkap' },
      { status: 500, headers: corsHeaders }
    );
  }

  const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
  const { data: authData, error: authError } = await supabasePublic.auth.getUser(access_token);

  if (authError || !authData?.user) {
    return NextResponse.json(
      { error: 'Token Google tidak valid atau sudah kadaluarsa' },
      { status: 401, headers: corsHeaders }
    );
  }

  const oauthUser = authData.user;
  const email = oauthUser.email;

  if (!email) {
    return NextResponse.json(
      { error: 'Email tidak tersedia dari akun Google' },
      { status: 400, headers: corsHeaders }
    );
  }

  const name =
    oauthUser.user_metadata?.full_name ||
    oauthUser.user_metadata?.name ||
    email;

  // Upsert user ke tabel users custom (berdasarkan email)
  // User Google langsung di-approve
  const { data: user, error: upsertError } = await supabaseServer
    .from('users')
    .upsert(
      {
        email: email.trim().toLowerCase(),
        name,
        approved: true,
        provider: 'google',
        // password sengaja tidak di-set untuk user Google
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id, name, email, approved')
    .single();

  if (upsertError || !user) {
    return NextResponse.json(
      { error: upsertError?.message ?? 'Gagal sinkronisasi data user' },
      { status: 500, headers: corsHeaders }
    );
  }

  // Generate custom JWT
  const token = await generateToken({ id: user.id, email: user.email });

  const cookieString = serialize('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return new NextResponse(
    JSON.stringify({
      message: 'Login Google berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        approved: Boolean(user.approved),
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieString,
        ...corsHeaders,
      },
    }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { supabaseServer } from '@/lib/supabase-server';
import { generateToken } from '@/lib/jwt';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email dan password wajib diisi' },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data: user, error } = await supabaseServer
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (error || !user) {
    return NextResponse.json(
      { error: 'Email atau password salah' },
      { status: 401, headers: corsHeaders }
    );
  }

  // User yang mendaftar via Google tidak memiliki password
  if (!user.password) {
    return NextResponse.json(
      { error: 'Akun ini terdaftar via Google. Silakan login menggunakan Google.' },
      { status: 400, headers: corsHeaders }
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json(
      { error: 'Email atau password salah' },
      { status: 401, headers: corsHeaders }
    );
  }

  if (!user.approved) {
    return NextResponse.json(
      { error: 'User belum di approve' },
      { status: 403, headers: corsHeaders }
    );
  }

  const token = await generateToken({ id: user.id, email: user.email });

  const cookieString = serialize('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return new NextResponse(
    JSON.stringify({
      message: 'Login sukses',
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

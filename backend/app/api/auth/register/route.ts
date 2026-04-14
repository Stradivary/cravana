import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabase-server';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const { name, gender, address, email, phoneNumber, password, fileUrl } = await req.json();

  if (!name || !gender || !address || !email || !phoneNumber || !password) {
    return NextResponse.json(
      { error: 'Name, gender, address, email, phone number, dan password wajib diisi' },
      { status: 400, headers: corsHeaders }
    );
  }

  // Check if email already registered
  const { data: existing } = await supabaseServer
    .from('users')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Email sudah terdaftar' },
      { status: 409, headers: corsHeaders }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabaseServer
    .from('users')
    .insert({
      name,
      gender,
      address,
      email: email.trim().toLowerCase(),
      phone_number: phoneNumber,
      password: hashedPassword,
      file_url: fileUrl ?? null,
      approved: false,
      provider: 'email',
    })
    .select('id, name, gender, address, email, phone_number, approved')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    {
      message: 'Registrasi berhasil',
      user,
    },
    { status: 201, headers: corsHeaders }
  );
}

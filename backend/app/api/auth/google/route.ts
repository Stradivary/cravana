import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

/**
 * GET /api/auth/google
 * Menghasilkan URL OAuth Google via Supabase.
 * Frontend redirect user ke URL tersebut untuk memulai proses login Google.
 *
 * Response: { url: string }
 */
export async function GET(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Konfigurasi Supabase tidak lengkap' },
      { status: 500, headers: corsHeaders }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Callback URL yang akan di-handle oleh frontend setelah OAuth selesai
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const redirectTo = `${frontendUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: 'Gagal membuat URL OAuth Google' },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json({ url: data.url }, { status: 200, headers: corsHeaders });
}

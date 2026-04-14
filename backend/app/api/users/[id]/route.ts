import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getCorsHeaders } from '@/lib/cors';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const { id } = await context.params;

  let { data: user, error } = await supabaseServer
    .from('users')
    .select('id, name, role, gender, address, email, phone_number, file_url, approved, created_at')
    .eq('id', id)
    .single();

  const isMissingFileUrlColumn = Boolean(error) && /file_url/i.test(error?.message ?? '');
  const isMissingRoleColumn = Boolean(error) && /role/i.test(error?.message ?? '');

  if (isMissingFileUrlColumn || isMissingRoleColumn) {
    const selectColumns = [
      'id',
      'name',
      ...(isMissingRoleColumn ? [] : ['role']),
      'gender',
      'address',
      'email',
      'phone_number',
      ...(isMissingFileUrlColumn ? [] : ['file_url']),
      'approved',
      'created_at',
    ].join(', ');

    const fallbackResult = await supabaseServer
      .from('users')
      .select(selectColumns)
      .eq('id', id)
      .single();

    const fallbackData = fallbackResult.data as {
      id: string;
      name: string;
      gender: string | null;
      address: string | null;
      email: string;
      phone_number: string | null;
      approved: boolean | null;
      created_at: string | null;
      file_url?: string | null;
      role?: string | null;
    } | null;

    user = fallbackData
      ? {
          ...fallbackData,
          file_url: isMissingFileUrlColumn ? null : fallbackData.file_url ?? null,
          role: isMissingRoleColumn ? null : fallbackData.role ?? null,
        }
      : null;
    error = fallbackResult.error;
  }

  if (error?.code === 'PGRST116' || !user) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        role: user.role ?? null,
        gender: user.gender,
        address: user.address,
        email: user.email,
        phoneNumber: user.phone_number ?? null,
        fileUrl: user.file_url ?? null,
        approved: Boolean(user.approved),
        createdAt: user.created_at ?? null,
      },
    },
    { status: 200, headers: corsHeaders }
  );
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  const { id } = await context.params;

  let { data: targetUser, error: targetUserError } = await supabaseServer
    .from('users')
    .select('id, role')
    .eq('id', id)
    .single();

  const isMissingRoleColumn = Boolean(targetUserError) && /role/i.test(targetUserError?.message ?? '');

  if (isMissingRoleColumn) {
    const fallbackTarget = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    targetUser = fallbackTarget.data ? { ...fallbackTarget.data, role: null } : null;
    targetUserError = fallbackTarget.error;
  }

  if (targetUserError?.code === 'PGRST116' || !targetUser) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404, headers: corsHeaders });
  }

  if (targetUserError) {
    return NextResponse.json({ error: targetUserError.message }, { status: 500, headers: corsHeaders });
  }

  if (targetUser.role === 'super_admin') {
    return NextResponse.json(
      { error: 'User dengan role super_admin tidak dapat dihapus' },
      { status: 403, headers: corsHeaders }
    );
  }

  const { error } = await supabaseServer.from('users').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }

  return NextResponse.json({ message: 'User berhasil dihapus' }, { status: 200, headers: corsHeaders });
}

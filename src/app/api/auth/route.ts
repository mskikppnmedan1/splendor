import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { username, password, role } = await req.json()
    const supabase = await createClient()

    // ── Login Satker ──────────────────────────────────────
    if (role === 'satker') {
      const { data: verified, error } = await supabase
        .rpc('verify_satker', { p_username: username, p_password: password })

      if (error || !verified || verified.length === 0) {
        return NextResponse.json({ error: 'Kode satker atau password salah.' }, { status: 401 })
      }

      const user = verified[0]

      if (!user.is_active) {
        return NextResponse.json({ error: 'Akun dinonaktifkan. Hubungi administrator.' }, { status: 403 })
      }

      const cookieStore = await cookies()
      cookieStore.set('satker_session', JSON.stringify({
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: 'satker',
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      })

      return NextResponse.json({ role: 'satker' })
    }

    // ── Login KPPN ────────────────────────────────────────
    const { data: user, error } = await supabase
      .from('users_kppn')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Akun dinonaktifkan. Hubungi administrator.' }, { status: 403 })
    }

    const { data: verified } = await supabase
      .rpc('verify_kppn', { p_username: username, p_password: password })

    if (!verified || verified.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('kppn_session', JSON.stringify({
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: 'kppn',
      kode_kppn: user.kode_kppn,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return NextResponse.json({ role: 'kppn' })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

// ── DELETE /api/auth → Logout ──────────────────────────────
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('kppn_session')
  cookieStore.delete('satker_session')
  return NextResponse.json({ success: true })
}
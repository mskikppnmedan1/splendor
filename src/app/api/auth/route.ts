import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getIp } from '@/lib/rate-limit'
import { validateString, validatePassword } from '@/lib/validate'
import { COOKIE_KPPN, COOKIE_SATKER } from '@/lib/session'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

/** Set cookie on the NextResponse directly so the browser receives it
 *  in the same HTTP response and it's guaranteed to be present on the
 *  very next request (including the middleware check after redirect). */
function setCookie(res: NextResponse, name: string, value: string) {
  res.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export async function POST(req: NextRequest) {
  // ── Rate limiting: max 10 login attempts per minute per IP ──
  const ip = getIp(req.headers)
  const rl = rateLimit(`login:${ip}`, { windowMs: 60_000, maxRequests: 10 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan login. Coba lagi dalam ${rl.retryAfter} detik.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 })
  }

  const { username, password, role } = body as Record<string, unknown>

  // ── Input validation ──────────────────────────────────────
  const usernameCheck = validateString(username, 'Username/Kode Satker', { min: 1, max: 100 })
  if (!usernameCheck.ok) return NextResponse.json({ error: usernameCheck.message }, { status: 400 })

  // Password validation — use a looser check (min 1) so existing short passwords
  // from before the 6-char rule was introduced are not silently rejected at login.
  const passwordCheck = validateString(password, 'Password', { min: 1, max: 100 })
  if (!passwordCheck.ok) return NextResponse.json({ error: passwordCheck.message }, { status: 400 })

  if (role !== 'satker' && role !== 'kppn') {
    return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 })
  }

  const cleanUsername = (username as string).trim()

  try {
    // ── Login Satker ──────────────────────────────────────
    if (role === 'satker') {
      const { data: verified, error } = await supabase
        .rpc('verify_satker', { p_username: cleanUsername, p_password: password })

      if (error || !verified || verified.length === 0) {
        return NextResponse.json({ error: 'Kode satker atau password salah.' }, { status: 401 })
      }

      const user = verified[0]

      if (!user.is_active) {
        return NextResponse.json({ error: 'Akun dinonaktifkan. Hubungi administrator.' }, { status: 403 })
      }

      const sessionData = JSON.stringify({
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: 'satker',
      })

      const res = NextResponse.json({ role: 'satker' })
      setCookie(res, COOKIE_SATKER, sessionData)
      return res
    }

    // ── Login KPPN ────────────────────────────────────────
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, nama, is_active, kode_kppn')
      .eq('username', cleanUsername)
      .eq('role', 'kppn')
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Akun dinonaktifkan. Hubungi administrator.' }, { status: 403 })
    }

    const { data: verified } = await supabase
      .rpc('verify_kppn', { p_username: cleanUsername, p_password: password })

    if (!verified || verified.length === 0) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 })
    }

    const sessionData = JSON.stringify({
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: 'kppn',
      kode_kppn: user.kode_kppn,
    })

    const res = NextResponse.json({ role: 'kppn' })
    setCookie(res, COOKIE_KPPN, sessionData)
    return res

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 })
  }
}

// ── DELETE /api/auth → Logout ──────────────────────────────
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_KPPN)
  cookieStore.delete(COOKIE_SATKER)

  // Also clear via response headers to be doubly sure
  const res = NextResponse.json({ success: true })
  res.cookies.delete(COOKIE_KPPN)
  res.cookies.delete(COOKIE_SATKER)
  return res
}

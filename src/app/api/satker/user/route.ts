import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { parseSatkerSession, parseKppnSession, COOKIE_KPPN, COOKIE_SATKER } from '@/lib/session'
import { validateString, validatePassword, validateKodeSatker } from '@/lib/validate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper: resolve session dari cookie
async function getSession() {
  const cookieStore = await cookies()
  const satkerRaw = cookieStore.get(COOKIE_SATKER)?.value
  const kppnRaw = cookieStore.get(COOKIE_KPPN)?.value

  const satker = parseSatkerSession(satkerRaw)
  if (satker) return satker

  const kppn = parseKppnSession(kppnRaw)
  if (kppn) return kppn

  return null
}

// GET → ambil session satker (untuk dashboard satker)
export async function GET() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_SATKER)?.value
  const session = parseSatkerSession(raw)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(session)
}

// POST → KPPN: tambah satker baru | Satker: simpan profil
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  // KPPN tambah satker baru
  if (session.role === 'kppn') {
    const { nama_satker, kode_satker, password } = data

    const checks = [
      validateString(nama_satker, 'Nama Satker', { min: 2, max: 200 }),
      validateKodeSatker(kode_satker),
      validatePassword(password),
    ]
    for (const check of checks) {
      if (!check.ok) return NextResponse.json({ error: check.message }, { status: 400 })
    }

    const { data: result, error } = await supabase
      .rpc('register_satker', {
        p_username: (kode_satker as string).trim(),
        p_password: password,
        p_nama_satker: (nama_satker as string).trim(),
        p_kode_satker: (kode_satker as string).trim(),
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase
      .from('profiles_satker')
      .update({ status: 'aktif' })
      .eq('id', result)

    return NextResponse.json({ success: true, id: result })
  }

  // Satker simpan profil
  const { profil, namaSatker } = data

  if (namaSatker !== undefined) {
    const check = validateString(namaSatker, 'Nama Satker', { min: 2, max: 200 })
    if (!check.ok) return NextResponse.json({ error: check.message }, { status: 400 })
  }

  const { error: profilError } = await supabase
    .from('profil_satker')
    .upsert({ id: session.id, ...(profil as object), updated_at: new Date().toISOString() })

  if (profilError) return NextResponse.json({ error: profilError.message }, { status: 500 })

  if (namaSatker) {
    await supabase
      .from('profiles_satker')
      .update({ nama_satker: (namaSatker as string).trim() })
      .eq('id', session.id)
  }

  return NextResponse.json({ success: true })
}

// PATCH → KPPN: reset password satker | Satker: ganti password sendiri
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  // KPPN reset password satker lain
  if (session.role === 'kppn') {
    const { id, password } = data

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
    }
    const pwCheck = validatePassword(password)
    if (!pwCheck.ok) return NextResponse.json({ error: pwCheck.message }, { status: 400 })

    const { error } = await supabase.rpc('update_satker_password', {
      p_id: id,
      p_new_password: password,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Satker ganti password sendiri
  const { oldPassword, newPassword } = data

  const oldCheck = validatePassword(oldPassword)
  if (!oldCheck.ok) return NextResponse.json({ error: oldCheck.message }, { status: 400 })

  const newCheck = validatePassword(newPassword)
  if (!newCheck.ok) return NextResponse.json({ error: newCheck.message }, { status: 400 })

  const { data: verified } = await supabase
    .rpc('verify_satker_by_id', { p_id: session.id, p_password: oldPassword })

  if (!verified || verified.length === 0) {
    return NextResponse.json({ error: 'Password lama salah.' }, { status: 401 })
  }

  const { error } = await supabase.rpc('update_satker_password', {
    p_id: session.id,
    p_new_password: newPassword,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

// DELETE → KPPN hapus satker
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'kppn') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 })
  }

  const { id } = body as Record<string, unknown>
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  }

  // Delete in order (profil_satker → profiles_satker → users)
  await supabase.from('profil_satker').delete().eq('id', id)
  await supabase.from('profiles_satker').delete().eq('id', id)
  await supabase.from('users').delete().eq('id', id)

  return NextResponse.json({ success: true })
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { parseKppnSession, parseSatkerSession, COOKIE_KPPN, COOKIE_SATKER } from '@/lib/session'
import { validateString, validateKodeSatker } from '@/lib/validate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getSession() {
  const cookieStore = await cookies()
  const kppn = parseKppnSession(cookieStore.get(COOKIE_KPPN)?.value)
  if (kppn) return kppn
  return parseSatkerSession(cookieStore.get(COOKIE_SATKER)?.value)
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 })
  }

  const { id, status, profil, nama_satker, kode_satker } = body as Record<string, unknown>

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  }

  // ── Update status satker (dari Kelola User) ──
  if (status !== undefined) {
    // Only KPPN allowed
    if (session.role !== 'kppn') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await supabase.from('profiles_satker').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ── Update nama dan/atau kode satker (dari import Excel) ──
  if (nama_satker !== undefined || kode_satker !== undefined) {
    if (session.role !== 'kppn') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const updateData: Record<string, string> = {}

    if (nama_satker !== undefined) {
      const check = validateString(nama_satker, 'Nama Satker', { min: 2, max: 200 })
      if (!check.ok) return NextResponse.json({ error: check.message }, { status: 400 })
      updateData.nama_satker = (nama_satker as string).trim()
    }

    if (kode_satker !== undefined) {
      const check = validateKodeSatker(kode_satker)
      if (!check.ok) return NextResponse.json({ error: check.message }, { status: 400 })
      updateData.kode_satker = (kode_satker as string).trim()
    }

    const { error: profileError } = await supabase
      .from('profiles_satker')
      .update(updateData)
      .eq('id', id)

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    if (kode_satker !== undefined) {
      await supabase
        .from('users')
        .update({ username: (kode_satker as string).trim(), kode_satker: (kode_satker as string).trim() })
        .eq('id', id)
    }

    return NextResponse.json({ success: true })
  }

  // ── Update profil satker ──
  // Satker only allowed to edit their own profile
  if (session.role === 'satker' && session.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (profil !== undefined) {
    if (typeof profil !== 'object' || profil === null || Array.isArray(profil)) {
      return NextResponse.json({ error: 'Data profil tidak valid.' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('profil_satker')
      .select('id')
      .eq('id', id)
      .single()

    let error
    if (existing) {
      ;({ error } = await supabase
        .from('profil_satker')
        .update({ ...profil, updated_at: new Date().toISOString() })
        .eq('id', id))
    } else {
      ;({ error } = await supabase
        .from('profil_satker')
        .insert({ id, ...profil, updated_at: new Date().toISOString() }))
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Tidak ada data yang diupdate.' }, { status: 400 })
}

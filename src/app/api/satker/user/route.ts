import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper cek session
async function getSession() {
  const cookieStore = await cookies()
  const satker = cookieStore.get('satker_session')
  const kppn = cookieStore.get('kppn_session')
  if (satker) return { ...JSON.parse(satker.value), role: 'satker' }
  if (kppn) return { ...JSON.parse(kppn.value), role: 'kppn' }
  return null
}

// GET → ambil session satker (untuk dashboard satker)
export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('satker_session')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(JSON.parse(session.value))
}

// POST → KPPN: tambah satker baru | Satker: simpan profil
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // KPPN tambah satker baru
  if (session.role === 'kppn') {
    const { nama_satker, kode_satker, password } = body
    if (!nama_satker || !kode_satker || !password)
      return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })

    const { data, error } = await supabase
      .rpc('register_satker', {
        p_username: kode_satker,
        p_password: password,
        p_nama_satker: nama_satker,
        p_kode_satker: kode_satker,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Langsung set status aktif
    await supabase
      .from('profiles_satker')
      .update({ status: 'aktif' })
      .eq('id', data)

    return NextResponse.json({ success: true, id: data })
  }

  // Satker simpan profil
  const { profil, namaSatker } = body
  const { error } = await supabase
    .from('profil_satker')
    .upsert({ id: session.id, ...profil, updated_at: new Date().toISOString() })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase
    .from('profiles_satker')
    .update({ nama_satker: namaSatker })
    .eq('id', session.id)

  return NextResponse.json({ success: true })
}

// PATCH → KPPN: reset password satker | Satker: ganti password sendiri
export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // KPPN reset password satker lain
  if (session.role === 'kppn') {
    const { id, password } = body
    if (!id || !password)
      return NextResponse.json({ error: 'ID dan password wajib diisi.' }, { status: 400 })

    await supabase.rpc('update_satker_password', { p_id: id, p_new_password: password })
    return NextResponse.json({ success: true })
  }

  // Satker ganti password sendiri
  const { oldPassword, newPassword } = body
  const { data: verified } = await supabase
    .rpc('verify_satker_by_id', { p_id: session.id, p_password: oldPassword })

  if (!verified || verified.length === 0)
    return NextResponse.json({ error: 'Password lama salah.' }, { status: 401 })

  await supabase.rpc('update_satker_password', { p_id: session.id, p_new_password: newPassword })
  return NextResponse.json({ success: true })
}

// DELETE → KPPN hapus satker
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'kppn')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  await supabase.from('profil_satker').delete().eq('id', id)
  await supabase.from('profiles_satker').delete().eq('id', id)
  await supabase.from('users').delete().eq('id', id)

  return NextResponse.json({ success: true })
}
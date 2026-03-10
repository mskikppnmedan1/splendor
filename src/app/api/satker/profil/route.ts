import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  // KPPN: akses profil satker by ID
  const kppnSession = cookieStore.get('kppn_session')
  if (kppnSession) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const { data: profil } = await supabase
      .from('profil_satker').select('*').eq('id', id).single()

    return NextResponse.json({ profil: profil || null })
  }

  // Satker: akses profil sendiri via cookie
  const satkerSession = cookieStore.get('satker_session')
  if (!satkerSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = JSON.parse(satkerSession.value)

  const [{ data: profiles }, { data: profil }] = await Promise.all([
    supabase.from('profiles_satker').select('nama_satker, kode_satker, status').eq('id', id).single(),
    supabase.from('profil_satker').select('*').eq('id', id).single(),
  ])

  return NextResponse.json({ profiles, profil })
} 
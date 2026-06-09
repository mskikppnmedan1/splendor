import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { parseKppnSession, parseSatkerSession, COOKIE_KPPN, COOKIE_SATKER } from '@/lib/session'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()

  // ── KPPN: akses profil satker by ID ──
  const kppnSession = parseKppnSession(cookieStore.get(COOKIE_KPPN)?.value)
  if (kppnSession) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID diperlukan.' }, { status: 400 })

    const { data: profil } = await supabase
      .from('profil_satker')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({ profil: profil ?? null })
  }

  // ── Satker: akses profil sendiri via cookie ──
  const satkerSession = parseSatkerSession(cookieStore.get(COOKIE_SATKER)?.value)
  if (!satkerSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: profiles }, { data: profil }] = await Promise.all([
    supabase.from('profiles_satker').select('nama_satker, kode_satker, status').eq('id', satkerSession.id).single(),
    supabase.from('profil_satker').select('*').eq('id', satkerSession.id).single(),
  ])

  return NextResponse.json({ profiles, profil })
}

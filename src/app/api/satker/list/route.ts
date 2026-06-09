import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  // Jalankan 3 query ke Supabase secara paralel
  const [
    { data, error },
    { data: profilData },
    { data: usersData },
  ] = await Promise.all([
    supabase.from('profiles_satker').select('*').order('nama_satker', { ascending: true }),
    supabase.from('profil_satker').select('id, updated_at'),
    supabase.from('users').select('id, updated_at').eq('role', 'satker'),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const profilMap = Object.fromEntries(
    (profilData || []).map((p: any) => [p.id, p.updated_at])
  )
  const usersMap = Object.fromEntries(
    (usersData || []).map((u: any) => [u.id, u.updated_at])
  )

  const list = (data || []).map((s: any) => ({
    ...s,
    updated_at: profilMap[s.id] ?? null,
    password_updated_at: usersMap[s.id] ?? null,
  }))

  return NextResponse.json({ list })
}

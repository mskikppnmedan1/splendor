/**
 * GET /api/satker/profil-batch
 * Returns all satker profiles in a single query — used by the admin dashboard
 * to avoid N+1 individual fetches.
 * Only accessible by KPPN role.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { parseKppnSession, COOKIE_KPPN } from '@/lib/session'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const cookieStore = await cookies()
  const session = parseKppnSession(cookieStore.get(COOKIE_KPPN)?.value)

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profil_satker')
    .select('*')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return as a map { [id]: profil } for O(1) lookup on the client
  const profilMap: Record<string, unknown> = {}
  for (const row of data ?? []) {
    profilMap[(row as Record<string, string>).id] = row
  }

  return NextResponse.json({ profilMap })
}

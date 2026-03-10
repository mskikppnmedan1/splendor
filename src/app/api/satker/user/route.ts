import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get('satker_session')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(JSON.parse(session.value))
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('satker_session')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = JSON.parse(session.value)
  const { oldPassword, newPassword } = await req.json()

  // Verifikasi password lama
  const { data: verified } = await supabase
    .rpc('verify_satker_by_id', { p_id: id, p_password: oldPassword })

  if (!verified || verified.length === 0) {
    return NextResponse.json({ error: 'Password lama salah.' }, { status: 401 })
  }

  // Update password baru
  const { error } = await supabase
    .from('users')
    .update({ password: supabase.rpc('crypt', { password: newPassword, salt: supabase.rpc('gen_salt', { type: 'bf' }) }) })
    .eq('id', id)

  // Lebih simpel pakai RPC:
  await supabase.rpc('update_satker_password', { p_id: id, p_new_password: newPassword })

  return NextResponse.json({ success: true })
}
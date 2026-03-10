'use server'

import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

// ── Logout ────────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Buat akun baru (dipakai KPPN untuk daftarkan Satker) ──
export async function createUser({
  email,
  password,
  nama,
  role,
  kode_satker,
  kode_kppn,
}: {
  email: string
  password: string
  nama: string
  role: 'satker' | 'kppn'
  kode_satker?: string
  kode_kppn?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama, role, kode_satker, kode_kppn },
  })

  if (error) throw new Error(error.message)
  return data.user
}

// ── Ambil profil user yang sedang login ───────────────────
export async function getCurrentProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
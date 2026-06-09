import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_KPPN, COOKIE_SATKER } from '@/lib/session'

// Endpoint khusus untuk sendBeacon saat tab/browser ditutup
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_KPPN)
  cookieStore.delete(COOKIE_SATKER)
  return new NextResponse(null, { status: 204 })
}

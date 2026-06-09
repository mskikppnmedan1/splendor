import { NextResponse, type NextRequest } from 'next/server'
import { parseKppnSession, parseSatkerSession, COOKIE_KPPN, COOKIE_SATKER } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Safe parse — malformed/tampered cookies are treated as "not logged in"
  const kppnUser = parseKppnSession(request.cookies.get(COOKIE_KPPN)?.value)
  const satkerUser = parseSatkerSession(request.cookies.get(COOKIE_SATKER)?.value)

  // Validate role field to prevent tampered cookies from elevating privileges
  const isKppn = kppnUser?.role === 'kppn'
  const isSatker = satkerUser?.role === 'satker'
  const isLoggedIn = isKppn || isSatker

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Belum login → redirect ke /login
  if (!isLoggedIn && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url)
    const redirect = NextResponse.redirect(loginUrl)
    // Clear potentially corrupted cookies
    redirect.cookies.delete(COOKIE_KPPN)
    redirect.cookies.delete(COOKIE_SATKER)
    return redirect
  }

  // Sudah login tapi akses /login → redirect ke dashboard masing-masing
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL(
      isKppn ? '/dashboard/admin' : '/dashboard/dashboard',
      request.url
    ))
  }

  // Satker tidak boleh akses /dashboard/admin
  if (pathname.startsWith('/dashboard/admin') && !isKppn) {
    return NextResponse.redirect(new URL('/dashboard/dashboard', request.url))
  }

  // KPPN tidak boleh akses /dashboard/dashboard
  if (pathname.startsWith('/dashboard/dashboard') && isKppn) {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|images).*)'],
}

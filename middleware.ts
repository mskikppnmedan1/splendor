import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Baca kedua custom cookie
  const kppnSession = request.cookies.get('kppn_session')?.value
  const satkerSession = request.cookies.get('satker_session')?.value

  const kppnUser = kppnSession ? JSON.parse(kppnSession) : null
  const satkerUser = satkerSession ? JSON.parse(satkerSession) : null

  const isLoggedIn = kppnUser || satkerUser
  const role = kppnUser ? 'kppn' : (satkerUser ? 'satker' : null)

  // Belum login → redirect ke /login
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Sudah login tapi akses /login → redirect ke dashboard masing-masing
  if (isLoggedIn && pathname === '/login') {
    return NextResponse.redirect(new URL(
      role === 'kppn' ? '/dashboard/admin' : '/dashboard/dashboard',
      request.url
    ))
  }

  // Satker tidak boleh akses /dashboard/admin
  if (pathname.startsWith('/dashboard/admin') && role !== 'kppn') {
    return NextResponse.redirect(new URL('/dashboard/dashboard', request.url))
  }

  // KPPN tidak boleh akses /dashboard/dashboard
  if (pathname.startsWith('/dashboard/dashboard') && role === 'kppn') {
    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|images).*)'],
}
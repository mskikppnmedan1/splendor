import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const kppnSession = request.cookies.get('kppn_session')?.value
  const kppnUser = kppnSession ? JSON.parse(kppnSession) : null

  let satkerUser = null
  let supabaseResponse = NextResponse.next({ request })

  if (!kppnUser) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    satkerUser = user
  }

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

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|images).*)'],
}
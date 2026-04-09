import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Tangkap response dasar yang akan dikembalikan
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Bangun jembatan komunikasi dengan Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update cookie di request dan response
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 3. Verifikasi Identitas Pengguna saat ini
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 4. Logika Pertahanan (Routing Logic)
  // Jika mencoba masuk ke area /dashboard tapi tidak punya sesi, lempar ke halaman akar (/)
  if (path.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Jika sudah login, dilarang melihat halaman otentikasi di akar (/)
  if (path === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// 5. Tentukan wilayah patroli Middleware
export const config = {
  matcher: [
    /*
     * Patroli semua path KECUALI:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/svg (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || ''

export async function middleware(request: NextRequest) {
  // Skip middleware if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase not configured — middleware skipping auth checks')
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Routes that require authentication (the (dashboard) route-group maps to these paths)
  const PROTECTED_PREFIXES = [
    '/dashboard',
    '/claims',
    '/verification-queue',
    '/blockchain-ledger',
    '/settings',
    '/setup',
  ]

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
      }

      // Check if user is platform owner or has admin role
      const isPlatformOwner = user.email === PLATFORM_OWNER_EMAIL

      if (!isPlatformOwner) {
        // Check database role — handle missing profile gracefully
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.warn('Could not fetch user profile for admin check:', profileError.message)
        }

        const isAdmin = profile?.role === 'ADMIN' ||
                        profile?.role === 'SUPER_ADMIN' ||
                        profile?.role === 'PLATFORM_OWNER'

        if (!isAdmin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }

    // Protect all dashboard route-group pages
    const isProtected = PROTECTED_PREFIXES.some(prefix =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(prefix + '/')
    )
    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // On error, allow the request through rather than creating a redirect loop
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/claims/:path*',
    '/claims',
    '/verification-queue/:path*',
    '/verification-queue',
    '/blockchain-ledger/:path*',
    '/blockchain-ledger',
    '/settings/:path*',
    '/settings',
    '/setup/:path*',
    '/setup',
  ],
}

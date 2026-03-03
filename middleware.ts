import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // CRITICAL: Create response object with request context
  const res = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // CRITICAL: Apply cookies to BOTH request and response
          // This ensures cookies persist across requests and responses
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on request for server-side operations
            req.cookies.set(name, value)
            // Set on response for browser to receive
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session - this calls setAll with updated cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname
  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'
  const isDashboard = pathname === '/admin' || pathname === '/admin/'

  // ⚠️ PROTECTION 1: No user or wrong email trying to access protected routes
  if (isAdminRoute && !isLoginPage && (!user || user.email !== 'giabao@gmail.com')) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // ⚠️ PROTECTION 2: Authenticated user trying to access login page (Guest-only route)
  if (user && user.email === 'giabao@gmail.com' && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  
  // SECURITY: Hard-harden protected routes with Cache-Control headers
  // Prevent browser caching of authenticated pages
  if (user && user.email === 'giabao@gmail.com' && isAdminRoute && !isLoginPage) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
  }
  
  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
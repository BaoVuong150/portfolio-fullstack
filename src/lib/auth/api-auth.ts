import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * SECURITY: Validates user session for protected API routes
 * Returns user if authenticated, otherwise returns 401 error response
 * 
 * Usage:
 * const { user, response } = await validateApiSession(request)
 * if (!user) return response // 401 Unauthorized
 */
export async function validateApiSession(request: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // CRITICAL: Extract and parse cookies from request headers
            // This is how Supabase SSR reads auth tokens from the request
            const cookieHeader = request.headers.get('cookie') || ''
            
            if (!cookieHeader) {
              return []
            }

            // Parse cookie header string into array of { name, value }
            // e.g., "sb-auth-token=xyz; sb-refresh-token=abc" -> [{ name: 'sb-auth-token', value: 'xyz' }, ...]
            const cookies: Array<{ name: string; value: string }> = cookieHeader
              .split(';')
              .map((cookie: string) => {
                const [name, value] = cookie.trim().split('=')
                return { name: name.trim(), value: (value || '').trim() }
              })
              .filter(({ name, value }: { name: string; value: string }) => name && value)

            return cookies
          },
          setAll(cookiesToSet) {
            // We can't set cookies in API routes, only read them
            // Cookie setting happens during auth operations in client/middleware
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    // No user or auth error or not admin = unauthorized
    if (!user || error || user.email !== 'giabao@gmail.com') {
      return {
        user: null,
        response: NextResponse.json(
          { error: 'Unauthorized: Authentication required or not an admin' },
          { status: 401 }
        ),
      }
    }

    return {
      user,
      response: null,
    }
  } catch (err) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Unauthorized: Invalid session' },
        { status: 401 }
      ),
    }
  }
}


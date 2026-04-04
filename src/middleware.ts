import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js 16 Middleware logic.
 * Lightweight route protection and redirection.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin Route Protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 1. Skip protection for login page to avoid redirect loops
    if (request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/login/forgot-password') {
      return response;
    }

    // 2. Redirect to login if unauthenticated
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // API protection for /api/admin
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }
  }

  return response;
}

// Config to match only relevant routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};

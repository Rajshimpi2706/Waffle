import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST NOT have any logic between this and returning
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // ---- Admin route protection ----
  if (path.startsWith('/admin') && path !== '/admin/login') {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('reason', 'session_expired');
      return NextResponse.redirect(url);
    }

    // Verify admin role from DB
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminUser || !adminUser.is_active) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('reason', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // ---- Customer account route protection ----
  if (path.startsWith('/account')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('reason', 'session_expired');
      url.searchParams.set('redirect', path);
      return NextResponse.redirect(url);
    }
  }

  // ---- Redirect logged-in users away from auth pages ----
  if (user && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/signup',
  ],
};

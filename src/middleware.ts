import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware - Safe Version
 * Allows public routes (/, /menu, /about, /contact, /api, /_next)
 * Protects only /admin routes and /account
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Setup Supabase Client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  const { data: { user } } = await supabase.auth.getUser();

  // 1. 🔒 Protect Admin Routes (MUST COME FIRST)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login' || pathname === '/admin/login/forgot-password' || pathname === '/admin/setup') {
      return response;
    }
    
    // Redirect if not logged in
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // Basic Middleware role check for early bounce (Server-Side Guards still double-check)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminUser || !['owner', 'manager', 'staff'].includes(adminUser.role.toLowerCase())) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('reason', 'unauthorized');
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 1.5 🔒 Protect Admin APIs strictly
  if (pathname.startsWith('/api/admin')) {
    // Allow setup route without role check (bootstrap)
    if (pathname === '/api/admin/setup') {
      return response;
    }
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // API Role verification
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminUser || !['owner', 'manager', 'staff'].includes(adminUser.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return response;
  }

  // 2. 🔒 Protect User Account Page
  if (pathname.startsWith('/account') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 3. ✅ Global Allow for all other routes (Home, Menu, About, Contact, etc.)
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

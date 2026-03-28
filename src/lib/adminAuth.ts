import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import { AdminRole } from '@/types';

/**
 * Server-side helper to verify admin status and roles.
 * Usage: const role = await getAdminRole();
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  return adminUser?.role || null;
}

/**
 * Protects an admin page and redirects if unauthorized.
 * Usage: await protectAdminPage(['owner', 'manager']);
 */
export async function protectAdminPage(allowedRoles: AdminRole[] = ['owner', 'manager', 'staff']) {
  const role = await getAdminRole();

  if (!role) {
    redirect('/admin/login');
  }

  if (!allowedRoles.includes(role)) {
    redirect('/admin?reason=unauthorized');
  }

  return role;
}

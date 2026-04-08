import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';
import { AdminRole } from '@/types';

/**
 * Server-side helper to confidently verify admin status and roles.
 * Never trusts frontend state. Explicitly queries the database securely.
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // 1. Deny actively if no session or there is an auth error
  if (!user || authError) {
    return null;
  }

  // 2. Query admin_users (always using server SDK)
  const { data: adminUser, error: dbError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  // 3. Deny-by-default Authorization Rule
  if (dbError || !adminUser || !adminUser.role) {
    return null;
  }

  // 4. Validate recognized role
  const role = adminUser.role.toLowerCase() as AdminRole;
  const recognizedRoles: AdminRole[] = ['owner', 'manager', 'staff'];
  
  if (!recognizedRoles.includes(role)) {
    return null;
  }

  return role;
}

/**
 * Server-Side Page Guard for robust access control.
 * By default restricts access to owners and managers.
 */
export async function protectAdminPage(allowedRoles: AdminRole[] = ['owner', 'manager']) {
  const role = await getAdminRole();

  // Strict deny redirect if no valid role exists
  if (!role) {
    redirect('/admin/login');
  }

  // Soft redirect if they have an admin account but insufficient privileges
  if (!allowedRoles.includes(role)) {
    redirect('/admin/login?reason=unauthorized');
  }

  return role;
}

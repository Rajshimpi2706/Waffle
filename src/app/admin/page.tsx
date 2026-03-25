import { Suspense } from 'react';
import { DashboardClient } from './DashboardClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | Waffle House Admin',
};

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Double check admin status
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminUser) {
    redirect('/admin/login?reason=unauthorized');
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-white rounded-2xl">Loading dashboard metrics...</div>}>
         <DashboardClient />
      </Suspense>
    </div>
  );
}

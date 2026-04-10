import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { OrdersClient } from './OrdersClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Orders Management | Waffle House Admin',
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminUser) {
    redirect('/admin/login?reason=unauthorized');
  }

  // Fetch ALL orders server-side (no date filter)
  const { data: initialOrders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(full_name, phone, email),
      order_items(
        *,
        product:products(name)
      ),
      payment:payments(status)
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h1>
        <p className="text-gray-500">Manage incoming orders, update statuses, and view details.</p>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-white rounded-2xl">Loading orders...</div>}>
         <OrdersClient initialOrders={initialOrders || []} adminRole={adminUser.role} />
      </Suspense>
    </div>
  );
}

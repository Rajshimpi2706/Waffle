import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { CustomersClient } from './CustomersClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Customers | Waffle House Admin',
};

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Pre-fetch all customers, their latest order, and total spend
  // Using a custom view or raw complex join. 
  // For basic Supabase without RPC, we can fetch customers with nested orders.
  const { data: customers } = await supabase
    .from('customers')
    .select(`
      id,
      full_name,
      phone,
      created_at,
      orders (
        id,
        total_amount,
        created_at,
        payment_status
      )
    `)
    .order('created_at', { ascending: false });

  // Transform data for UI to calculate LTV (Life Time Value) and Order Count
  const formattedCustomers = (customers || []).map((c: any) => {
    const paidOrders = c.orders?.filter((o: any) => o.payment_status === 'paid') || [];
    const totalSpend = paidOrders.reduce((acc: number, o: any) => acc + o.total_amount, 0);
    const lastOrderDate = paidOrders.length > 0
      ? new Date(Math.max(...paidOrders.map((o: any) => new Date(o.created_at).getTime())))
      : null;

    return {
      id: c.id,
      full_name: c.full_name,
      phone: c.phone,
      joined_at: c.created_at,
      total_orders: paidOrders.length,
      total_spend: totalSpend,
      last_order_at: lastOrderDate,
    };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customers</h1>
        <p className="text-gray-500">View customer history, lifetime value, and details.</p>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-white rounded-2xl">Loading customers...</div>}>
         <CustomersClient initialCustomers={formattedCustomers} />
      </Suspense>
    </div>
  );
}

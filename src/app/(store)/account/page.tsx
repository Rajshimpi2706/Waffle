import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AccountClient } from './AccountClient';

export const metadata = {
  title: 'My Account | Waffle House',
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?reason=unauthorized');
  }

  // Fetch full customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  // Fetch order history
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      total_amount,
      order_status,
      payment_status,
      order_items(
        product:products(name),
        quantity
      )
    `)
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false });

  // Fetch saved addresses
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-8 animate-fade-in">
          My Account
        </h1>
        <AccountClient 
          user={user} 
          customer={customer} 
          orders={orders || []} 
          addresses={addresses || []} 
        />
      </div>
    </div>
  );
}

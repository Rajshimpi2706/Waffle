import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ShoppingBag, ChevronRight, Package, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Order History | Waffle Wala',
};

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?reason=unauthorized');
  }

  // 1. Fetch Customer Profile
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  // 2. Fetch Orders (Limit for scalability)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      total_amount,
      status,
      items:order_items(quantity, product_name)
    `)
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching order history:', error);
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-10 lg:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <div className="mb-10 animate-fade-in">
          <Link href="/account" className="text-[#8B5E3C] hover:text-[#C17839] flex items-center gap-2 text-sm font-bold mb-4">
             <ShoppingBag size={16} />
             My Profile
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">Your Order History</h1>
          <p className="text-gray-500 mt-2 font-medium">Reorder your favorites or track recent waffles.</p>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center shadow-sm border border-gray-100 animate-slide-up">
            <div className="w-24 h-24 bg-[#FDF6EC] rounded-full flex items-center justify-center mx-auto mb-8">
               <Package className="text-[#C17839]" size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-10 text-lg">
              Looks like you haven't ordered any delicious waffles yet. Your first bite is just a few clicks away!
            </p>
            <Link 
              href="/menu" 
              className="inline-flex items-center justify-center px-10 h-16 bg-[#C17839] text-white font-black rounded-2xl hover:bg-[#A8662D] transition-all shadow-xl hover:shadow-[#C17839]/20 active:scale-95"
            >
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {orders.map((order) => (
              <Link 
                key={order.id} 
                href={`/order/${order.id}/track`}
                className="group block bg-white hover:bg-gray-50 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 transition-all hover:scale-[1.01] hover:shadow-md active:scale-100"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Left: General Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status as any} />
                      <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-widest">{order.order_number}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-black text-xl text-gray-900">
                        {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'} Ordered
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1 italic">
                        {order.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price & Date */}
                  <div className="flex flex-row md:flex-col justify-between items-end gap-2 md:text-right border-t md:border-t-0 pt-6 md:pt-0 border-gray-100">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase flex items-center justify-end gap-1 mb-1">
                          <Clock size={14} /> Placed On
                        </p>
                        <p className="font-bold text-gray-800">
                          {format(new Date(order.created_at), 'dd MMM yyyy, p')}
                        </p>
                    </div>
                    <div className="mt-auto">
                      <p className="text-2xl font-black text-[#C17839]">{formatCurrency(order.total_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* View Details Hint */}
                <div className="mt-6 flex items-center justify-end text-sm font-bold text-[#8B5E3C] group-hover:text-[#C17839] transition-colors gap-1">
                  View Timeline & Tracking
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

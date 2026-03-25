'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Package, MapPin, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface AccountClientProps {
  user: any;
  customer: any;
  orders: any[];
  addresses: any[];
}

export function AccountClient({ user, customer, orders, addresses }: AccountClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/');
    router.refresh();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'success';
      case 'cancelled': 
      case 'refunded': return 'destructive';
      default: return 'gold';
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
      
      {/* Sidebar Navigation */}
      <aside className="md:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5D5C0] p-4 flex flex-col gap-2">
          
          <div className="p-4 mb-2 bg-[#FDF6EC] rounded-xl text-center">
            <div className="w-16 h-16 bg-[#C17839] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
               {customer?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-semibold text-[#3B1F0A]">{customer?.full_name || 'Valued Guest'}</h2>
            <p className="text-sm text-[#8B5E3C] truncate">{user.email}</p>
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'orders' ? 'bg-[#3B1F0A] text-white font-medium' : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A]'
            }`}
          >
            <Package size={20} /> Order History
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'addresses' ? 'bg-[#3B1F0A] text-white font-medium' : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A]'
            }`}
          >
            <MapPin size={20} /> Saved Addresses
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
              activeTab === 'profile' ? 'bg-[#3B1F0A] text-white font-medium' : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A]'
            }`}
          >
            <User size={20} /> Profile Settings
          </button>

          <div className="my-2 border-t border-[#F5E6CC]"></div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left text-red-600 hover:bg-red-50 font-medium"
          >
            <LogOut size={20} /> Log Out
          </button>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white rounded-2xl shadow-sm border border-[#E5D5C0] p-6 md:p-8 min-h-[500px]">
        
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-serif font-bold text-[#3B1F0A] mb-6">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-[#C4A882] mb-4" />
                <p className="text-[#8B5E3C] mb-6">You haven't placed any orders yet.</p>
                <Link href="/menu">
                  <Button variant="primary">Start Ordering</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#F0E0C8] rounded-2xl p-5 hover:border-[#C17839] transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-[#3B1F0A]">{order.order_number}</span>
                          <Badge variant={getStatusColor(order.order_status) as any} className="capitalize">
                            {order.order_status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#8B5E3C]">{format(new Date(order.created_at), 'PPP at p')}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-lg text-[#3B1F0A]">{formatCurrency(order.total_amount)}</p>
                        <p className="text-xs text-[#8B5E3C] uppercase">{order.payment_status}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-[#3B1F0A] mb-4 line-clamp-2">
                       {order.order_items?.map((item: any) => `${item.quantity}x ${item.product.name}`).join(', ')}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-[#F5E6CC]">
                      {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.order_status) && (
                        <Link href={`/track-order/${order.order_number}`}>
                          <Button variant="outline" size="sm">Track Order</Button>
                        </Link>
                      )}
                      <Link href={`/order/success?order_number=${order.order_number}`}>
                         <Button variant="ghost" size="sm" className="hidden sm:inline-flex">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-[#3B1F0A]">Saved Addresses</h2>
                <Button variant="outline" size="sm">Add New</Button>
             </div>
             
             {addresses.length === 0 ? (
               <div className="text-center py-12">
                 <MapPin size={48} className="mx-auto text-[#C4A882] mb-4" />
                 <p className="text-[#8B5E3C]">No addresses saved yet. They will be saved automatically when you place an order.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {addresses.map((address) => (
                    <div key={address.id} className="border border-[#F0E0C8] rounded-2xl p-5 relative group bg-[#FDF6EC]">
                       {address.is_default && (
                         <Badge variant="gold" className="absolute top-4 right-4 text-[10px]">Default</Badge>
                       )}
                       <p className="font-semibold text-[#3B1F0A] mb-1">{address.full_name}</p>
                       <p className="text-sm text-[#8B5E3C] leading-relaxed mb-3">
                         {address.address_line1},<br/>
                         {address.city}, {address.state} - {address.pincode}
                       </p>
                       <p className="text-sm text-[#8B5E3C]">Ph: {address.phone}</p>
                    </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in max-w-lg">
             <h2 className="text-2xl font-serif font-bold text-[#3B1F0A] mb-6">Profile Settings</h2>
             
             <div className="space-y-4 mb-8 text-[#3B1F0A]">
                <div>
                   <label className="block text-sm text-[#8B5E3C] mb-1">Full Name</label>
                   <p className="font-medium p-3 bg-gray-50 rounded-xl border border-gray-100">{customer?.full_name}</p>
                </div>
                <div>
                   <label className="block text-sm text-[#8B5E3C] mb-1">Email (Immutable)</label>
                   <p className="font-medium p-3 bg-gray-50 rounded-xl border border-gray-100">{user.email}</p>
                </div>
                <div>
                   <label className="block text-sm text-[#8B5E3C] mb-1">Phone</label>
                   <p className="font-medium p-3 bg-gray-50 rounded-xl border border-gray-100">{customer?.phone || 'Not provided'}</p>
                </div>
             </div>

             <div className="pt-6 border-t border-[#F5E6CC]">
                <h3 className="font-semibold text-[#3B1F0A] mb-3">Security</h3>
                <Button variant="outline" className="w-full sm:w-auto">Update Password</Button>
             </div>
          </div>
        )}

      </main>

    </div>
  );
}

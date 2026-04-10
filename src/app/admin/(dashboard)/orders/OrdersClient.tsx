'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

import { useRouter } from 'next/navigation';

interface OrdersClientProps {
  initialOrders: any[];
  adminRole: string; // 'owner' | 'manager' | 'staff'
}

export function OrdersClient({ initialOrders, adminRole }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'completed', 'cancelled'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'yesterday', '7d', '30d'
  const router = useRouter();
  
  // Sync local state when server data updates (e.g., after router.refresh())
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  // Realtime updates
  useEffect(() => {
    const supabase = createClient();
    const subscription = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
             setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
             toast.info(`Order ${payload.new.order_number} status changed to ${payload.new.status}`);
          } else if (payload.eventType === 'INSERT') {
             toast.success(`New Order received: ${payload.new.order_number}`);
             // Auto-refresh the server component to fetch full complex joins
             router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [router]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

      toast.success('Order status updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      order.order_number.toLowerCase().includes(q) || 
      (order.customer?.full_name?.toLowerCase() || '').includes(q) ||
      (order.shipping_address?.full_name?.toLowerCase() || '').includes(q);

    if (!matchesSearch) return false;

    // Status Filter
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);
    } else if (statusFilter === 'completed') {
      matchesStatus = order.status === 'delivered';
    } else if (statusFilter === 'cancelled') {
      matchesStatus = ['cancelled', 'failed', 'refunded'].includes(order.status);
    }
    if (!matchesStatus) return false;

    // Time Filter
    if (timeFilter !== 'all') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const startOfYesterday = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 1));
      
      if (timeFilter === 'today') {
        if (orderDate < startOfToday) return false;
      } else if (timeFilter === 'yesterday') {
        if (orderDate < startOfYesterday || orderDate >= startOfToday) return false;
      } else if (timeFilter === '7d') {
        const sevenDaysAgo = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 7));
        if (orderDate < sevenDaysAgo) return false;
      } else if (timeFilter === '30d') {
        const thirtyDaysAgo = new Date(new Date(startOfToday).setDate(startOfToday.getDate() - 30));
        if (orderDate < thirtyDaysAgo) return false;
      }
    }
    
    return true;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'delivered': return 'success';
      case 'cancelled': 
      case 'failed': return 'destructive';
      case 'refunded': return 'secondary';
      case 'out_for_delivery': return 'default';
      default: return 'gold';
    }
  };

  const timeFilterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in text-[#3B1F0A] pb-24 lg:pb-20">
      
      {/* Time-Based Filter Bar */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0 gap-3">
        {timeFilterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setTimeFilter(opt.id)}
            className={cn(
              "whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm",
              timeFilter === opt.id 
                ? "bg-[#3B1F0A] text-white border-[#3B1F0A] shadow-md scale-105" 
                : "bg-white text-[#8B5E3C] border-[#F5E6CC] hover:bg-[#FDF6EC]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Premium Controls Architecture */}
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-5 lg:p-8 shadow-soft border border-[#F5E6CC] flex flex-col lg:flex-row gap-5 lg:gap-6 justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C17839]/10" />
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 items-center">
          <div className="relative w-full sm:w-80 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" size={18} />
             <Input 
               placeholder="Search protocol, name..." 
               className="pl-12 h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-2xl focus:shadow-premium transition-all font-bold"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-hide">
             <span className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-60 ml-2 whitespace-nowrap">Status:</span>
             <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-40 h-14 bg-white border-[#F5E6CC] rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-soft"
             >
                <option value="active">Active Orders</option>
                <option value="completed">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
                <option value="all">Full History</option>
             </Select>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => window.location.reload()} 
          className="h-14 rounded-2xl border-[#F5E6CC] flex gap-3 px-8 text-[#3B1F0A] font-black uppercase tracking-widest text-[10px] hover:bg-[#FDF6EC] hover:shadow-soft transition-all active:scale-95 group w-full lg:w-auto"
        >
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" /> 
          Sync Records
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[3rem] shadow-medium border border-[#F5E6CC] overflow-hidden relative">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm text-left align-middle">
            <thead className="bg-[#FDF6EC]/50">
              <tr>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Reference & Chrono</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Client (Type)</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Composition</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Financials</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px] w-64">Protocol Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FDF6EC]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#FDF6EC]/20 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-serif font-black text-[#3B1F0A] text-lg group-hover:text-[#C17839] transition-colors tracking-tight">#{order.order_number}</p>
                      <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-50">{format(new Date(order.created_at), 'hh:mm a, dd MMM')}</p>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-bold text-[#3B1F0A] tracking-tight">{order.shipping_address?.full_name || order.customer?.full_name || 'Anonymous Guest'}</p>
                      {(() => {
                        const phone = order.shipping_address?.phone || order.customer?.phone;
                        if (!phone || String(phone).length < 5) return null;
                        return (
                          <p className="text-[12px] font-semibold text-[#C17839] mt-1">📞 {phone}</p>
                        );
                      })()}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C17839] opacity-40" />
                        <span className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-60">{order.order_type}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="max-w-[250px] space-y-1">
                        {order.order_items?.map((item: any, idx: number) => (
                          <p key={idx} className="truncate text-[#8B5E3C] text-[10px] font-bold uppercase tracking-wide">
                             <span className="text-[#3B1F0A] font-black">{item.quantity}x</span> {item.product?.name || item.product_name}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-serif font-black text-[#3B1F0A] text-xl">{formatCurrency(order.total_amount)}</p>
                      <Badge variant={order.payment?.[0]?.status === 'paid' ? 'success' : order.payment?.[0]?.status === 'failed' ? 'destructive' : 'secondary' as any} className="mt-2 uppercase text-[9px] font-black tracking-widest rounded-full px-4 border shadow-sm">
                        {order.payment?.[0]?.status || 'pending payment'}
                      </Badge>
                    </td>
                    <td className="px-10 py-8">
                      <StatusPicker order={order} onChange={handleStatusChange} getStatusBadgeVariant={getStatusBadgeVariant} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 border border-[#F5E6CC] text-center shadow-soft">
            <EmptyState />
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-soft border border-[#F5E6CC] space-y-5 relative active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-serif font-black text-[#3B1F0A] text-xl tracking-tight">#{order.order_number}</p>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-50">{format(new Date(order.created_at), 'hh:mm a, dd MMM')}</p>
                </div>
                <p className="font-serif font-black text-[#C17839] text-xl">{formatCurrency(order.total_amount)}</p>
              </div>

              <div className="bg-[#FDF6EC]/50 rounded-2xl p-4 space-y-2">
                <p className="font-bold text-[#3B1F0A] text-sm">{order.shipping_address?.full_name || order.customer?.full_name || 'Anonymous Guest'}</p>
                {(() => {
                  const phone = order.shipping_address?.phone || order.customer?.phone;
                  if (!phone || String(phone).length < 5) return null;
                  return (
                    <p className="text-xs font-semibold text-[#8B5E3C]">📞 {phone}</p>
                  );
                })()}
                <div className="flex flex-wrap gap-2 pt-1">
                  {order.order_items?.map((item: any, idx: number) => (
                    <span key={idx} className="bg-white px-2 py-1 rounded-lg text-[9px] font-black uppercase text-[#8B5E3C] border border-[#F5E6CC shadow-xs]">
                      {item.quantity}x {item.product?.name || item.product_name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <Badge variant={order.payment?.[0]?.status === 'paid' ? 'success' : 'secondary' as any} className="uppercase text-[8px] font-black tracking-widest rounded-full px-3 py-1">
                  {order.payment?.[0]?.status || 'unpaid'}
                </Badge>
                <div className="flex-1">
                  <StatusPicker order={order} onChange={handleStatusChange} getStatusBadgeVariant={getStatusBadgeVariant} isMobile />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

// ── Shared Sub-components ──────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
       <div className="w-16 lg:w-20 h-16 lg:h-20 bg-[#FDF6EC] rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center text-[#F5E6CC]">
          <AlertCircle size={40} />
       </div>
       <div>
          <p className="text-xl lg:text-2xl font-serif font-black text-[#3B1F0A]">No Records Found</p>
          <p className="text-[#8B5E3C] mt-2 font-medium italic opacity-60 text-sm lg:text-base">"Adjust your filters to discover hidden treasures."</p>
       </div>
    </div>
  );
}

function StatusPicker({ order, onChange, getStatusBadgeVariant, isMobile }: any) {
  if (['delivered', 'cancelled', 'failed', 'refunded'].includes(order.status)) {
    return (
      <div className="flex justify-end lg:block">
        <Badge variant={getStatusBadgeVariant(order.status) as any} className="capitalize font-black text-[10px] tracking-widest rounded-full px-6 py-2 border shadow-sm">
          {order.status.replace(/_/g, ' ')}
        </Badge>
      </div>
    );
  }

  return (
    <div className="relative group/picker w-full">
      <Select 
        value={order.status}
        onChange={(e) => onChange(order.id, e.target.value)}
        className={cn(
          "w-full text-[10px] font-black uppercase tracking-widest rounded-xl border-[#F5E6CC] shadow-soft transition-all",
          isMobile ? "h-11" : "h-12",
          order.status === 'pending' ? 'bg-yellow-50/50 text-yellow-800' :
          order.status === 'confirmed' ? 'bg-blue-50/50 text-blue-800' :
          order.status === 'preparing' ? 'bg-orange-50/50 text-orange-800' :
          order.status === 'ready' ? 'bg-purple-50/50 text-purple-800' :
          order.status === 'out_for_delivery' ? 'bg-indigo-50/50 text-indigo-800' : ''
        )}
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready</option>
        <option value="out_for_delivery">Out for Delivery</option>
        <option value="delivered">Delivered ✓</option>
        <option value="cancelled">Cancelled ✗</option>
      </Select>
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#22C55E] animate-pulse shadow-sm border border-white" />
    </div>
  );
}

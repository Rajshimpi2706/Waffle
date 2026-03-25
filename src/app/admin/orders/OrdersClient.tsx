'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface OrdersClientProps {
  initialOrders: any[];
  adminRole: string; // 'owner' | 'manager' | 'staff'
}

export function OrdersClient({ initialOrders, adminRole }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'completed', 'cancelled'
  
  // Realtime updates
  useEffect(() => {
    const supabase = createClient();
    const subscription = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          // Quick merge strategy for active session (refreshing fully handles complex joins for now pending deep real-time hydration)
          // For simplicity in UI logic while real-time fires, we'll auto-refresh the list if visible active orders change,
          // OR we just mutate the specific row's status locally if it's an update.
          if (payload.eventType === 'UPDATE') {
             setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
             toast.info(`Order ${payload.new.order_number} status changed to ${payload.new.order_status}`);
          } else if (payload.eventType === 'INSERT') {
             toast.success(`New Order received: WAFFLE...`);
             // We won't auto-fetch full join right now to save bandwidth natively, they can hit refresh.
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

      toast.success('Order status updated');
      // local state update is handled by the real-time listener above!
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    // 1. Search (Order Number, Customer Fullname)
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      order.order_number.toLowerCase().includes(q) || 
      (order.customer?.full_name?.toLowerCase() || '').includes(q) ||
      (order.shipping_address?.full_name?.toLowerCase() || '').includes(q);

    if (!matchesSearch) return false;

    // 2. Status Group
    if (statusFilter === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.order_status);
    }
    if (statusFilter === 'completed') return order.order_status === 'delivered';
    if (statusFilter === 'cancelled') return ['cancelled', 'refunded'].includes(order.order_status);
    
    return true; // 'all'
  });

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'delivered': return 'success';
      case 'cancelled': 
      case 'refunded': return 'destructive';
      case 'out_for_delivery': return 'default';
      case 'completed': return 'success';
      default: return 'gold';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <Input 
               placeholder="Search orders..." 
               className="pl-10"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-32"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="all">All Today</option>
          </Select>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="flex gap-2 w-full sm:w-auto">
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm text-left align-middle">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Order & Time</th>
              <th className="px-6 py-4 font-medium">Customer (Type)</th>
              <th className="px-6 py-4 font-medium">Items</th>
              <th className="px-6 py-4 font-medium">Payment</th>
              <th className="px-6 py-4 font-medium w-48">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                     <AlertCircle size={32} />
                     <p>No orders found matching your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50">
                  
                  {/* Order ID and Date */}
                  <td className="px-6 py-4">
                    <p className="font-mono font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-gray-500 text-xs mt-1">{format(new Date(order.created_at), 'hh:mm a')}</p>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {order.shipping_address?.full_name || order.customer?.full_name || 'Guest'}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-[10px] uppercase">
                      {order.order_type}
                    </Badge>
                  </td>

                  {/* Items Summary */}
                  <td className="px-6 py-4">
                    <div className="max-w-[200px]">
                      {order.order_items?.map((item: any, idx: number) => (
                        <p key={idx} className="truncate text-gray-700 text-xs">
                           <span className="font-semibold">{item.quantity}x</span> {item.product.name}
                        </p>
                      ))}
                    </div>
                  </td>

                  {/* Financials */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                    <Badge variant={order.payment_status === 'paid' ? 'success' : order.payment_status === 'failed' ? 'destructive' : 'secondary' as any} className="mt-1 uppercase text-[10px]">
                      {order.payment_status}
                    </Badge>
                  </td>

                  {/* Actions / Status Picker */}
                  <td className="px-6 py-4">
                    {order.payment_status === 'paid' && !['delivered', 'cancelled', 'refunded'].includes(order.order_status) ? (
                      <Select 
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-semibold uppercase ${
                          order.order_status === 'pending' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                          order.order_status === 'preparing' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          order.order_status === 'ready' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          order.order_status === 'out_for_delivery' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : ''
                        }`}
                      >
                         {/* We enforce flow manually by providing options based on current logic */}
                         {order.order_status === 'pending' && <option value="pending">Pending</option>}
                         {(order.order_status === 'pending' || order.order_status === 'confirmed') && <option value="confirmed">Confirm</option>}
                         <option value="preparing">Preparing</option>
                         <option value="ready">Ready for Pickup</option>
                         {order.order_type === 'delivery' && <option value="out_for_delivery">Out for Delivery</option>}
                         <option value="delivered">Delivered</option>
                         {adminRole !== 'staff' && <option value="cancelled">Cancel Order</option>}
                      </Select>
                    ) : (
                       <Badge variant={getStatusBadgeVariant(order.order_status) as any} className="capitalize">
                         {order.order_status.replace(/_/g, ' ')}
                       </Badge>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

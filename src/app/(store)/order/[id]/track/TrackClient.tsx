'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { ShoppingBag, Calendar, Receipt, Phone, ArrowLeft, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface TrackClientProps {
  initialOrder: Order;
  phoneLast4?: string | null;
}

export function TrackClient({ initialOrder, phoneLast4 }: TrackClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchLatestStatus = useCallback(async () => {
    try {
      setIsPolling(true);
      const url = `/api/orders/${order.order_number}${phoneLast4 ? `?phone=${phoneLast4}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setOrder(result.data);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.error('Polling failed:', err);
    } finally {
      setIsPolling(false);
    }
  }, [order.order_number, phoneLast4]);

  useEffect(() => {
    // 1. Initial Polling setup (Fallback)
    const interval = setInterval(fetchLatestStatus, 15000); // 15s polling

    // 2. Realtime Subscription (Optional if server-side realtime is established)
    // For now, we rely on the 15s polling as per 'Resilient Polling' requirement
    
    return () => clearInterval(interval);
  }, [fetchLatestStatus]);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 lg:py-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/account/orders" className="text-[#8B5E3C] hover:text-[#C17839] flex items-center gap-2 text-sm font-bold mb-4 transition-colors">
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            Track Order
            {isPolling && <RefreshCcw size={18} className="text-[#C17839] animate-spin" />}
          </h1>
          <p className="text-gray-500 font-medium">#{order.order_number}</p>
        </div>
        <div className="flex flex-col items-end">
          <OrderStatusBadge status={order.status} className="text-sm py-1.5 px-4" />
          <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase tracking-tighter">
            Last update: {format(lastUpdated, 'HH:mm:ss')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Timeline (Left/Center) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
            <OrderTimeline order={order} />
          </div>
        </div>

        {/* Order Summary Sidebar (Right) */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Receipt size={20} className="text-[#C17839]" />
              Order Summary
            </h2>
            
            <div className="space-y-4 pb-6 border-b border-dashed border-gray-200">
               {order.items?.map((item) => (
                 <div key={item.id} className="flex justify-between items-start gap-4">
                   <div className="flex-1">
                     <p className="font-bold text-gray-800 leading-tight">{item.product_name}</p>
                     <p className="text-xs text-gray-400 font-medium leading-tight">Qty: {item.quantity}</p>
                   </div>
                   <p className="font-bold text-gray-900">{formatCurrency(item.line_total)}</p>
                 </div>
               ))}
            </div>

            <div className="py-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-800">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-gray-100">
                <span className="font-black text-gray-900">Total</span>
                <span className="font-black text-[#C17839]">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Placed On</p>
                  <p className="font-bold text-gray-700">{format(new Date(order.created_at), 'dd MMM yyyy, p')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contact</p>
                  <p className="font-bold text-gray-700">{order.customer_phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

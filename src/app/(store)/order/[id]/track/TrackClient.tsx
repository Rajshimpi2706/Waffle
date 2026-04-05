'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';
import { ShoppingBag, Calendar, Receipt, Phone, ArrowLeft, RefreshCcw, Star, ShieldCheck, Zap } from 'lucide-react';
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
    const interval = setInterval(fetchLatestStatus, 15000); 
    return () => clearInterval(interval);
  }, [fetchLatestStatus]);

  return (
    <div className="bg-[#FDF6EC] min-h-screen">
      <div className="max-w-6xl mx-auto w-full px-4 py-16 lg:py-24 animate-fade-in">
        
        {/* Premium Header Architecture */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 relative">
          <div className="space-y-6">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-[#F5E6CC] text-[#3B1F0A] rounded-2xl text-xs font-black uppercase tracking-widest shadow-soft hover:shadow-medium hover:-translate-x-1 transition-all"
            >
              <ArrowLeft size={16} />
              Return Storefront
            </Link>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-serif font-black text-[#3B1F0A] tracking-tighter">
                  Track Your <span className="text-[#C17839]">Waffle</span>
                </h1>
                {isPolling && <RefreshCcw size={24} className="text-[#C17839] animate-spin opacity-50" />}
              </div>
              <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] opacity-60">
                Order Protocol #{order.order_number}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
             <div className="bg-white p-4 rounded-3xl shadow-soft border border-[#F5E6CC] flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" />
                <div>
                   <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Live Updates Enabled</p>
                   <p className="text-xs font-bold text-[#3B1F0A]">Last Refresh: {format(lastUpdated, 'HH:mm:ss')}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Timeline (Left/Center) */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-white rounded-[3.5rem] p-10 lg:p-20 shadow-premium border border-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Star size={300} className="text-[#3B1F0A]" />
               </div>
               <OrderTimeline order={order} />
            </div>

            {/* Support Micro-Card */}
            <div className="bg-[#3B1F0A] rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-medium relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-[#C17839]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#C17839] shrink-0">
                     <Phone size={28} />
                  </div>
                  <div>
                     <h4 className="text-white text-xl font-serif font-bold">Need assistance?</h4>
                     <p className="text-white/60 font-medium">Our waffle concierge is just a call away for any order queries.</p>
                  </div>
               </div>
               <a href="tel:+919876543210" className="px-8 py-4 bg-white text-[#3B1F0A] font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                  Contact Support
               </a>
            </div>
          </div>

          {/* Order Summary Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-soft border border-[#F5E6CC] lg:sticky lg:top-28 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C17839]/10" />
              <h2 className="text-2xl font-serif font-black text-[#3B1F0A] mb-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839]">
                  <Receipt size={20} />
                </div>
                Order Receipt
              </h2>
              
              <div className="space-y-6 pb-8 mb-8 border-b border-dashed border-[#F5E6CC]">
                 {order.items?.map((item) => (
                   <div key={item.id} className="flex justify-between items-start gap-6 group">
                     <div className="flex-1">
                       <p className="font-bold text-[#3B1F0A] leading-tight group-hover:text-[#C17839] transition-colors">{item.product_name}</p>
                       <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-60">Quantity: {item.quantity}</p>
                     </div>
                     <p className="font-serif font-black text-[#3B1F0A]">{formatCurrency(item.line_total)}</p>
                   </div>
                 ))}
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-[#8B5E3C] font-medium">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-[#FDF6EC] p-6 rounded-2xl border border-[#F5E6CC] mt-6">
                  <span className="text-lg font-serif font-black text-[#3B1F0A]">Grand Total</span>
                  <span className="text-2xl font-serif font-black text-[#C17839]">{formatCurrency(order.total_amount ?? order.subtotal ?? 0)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839] shadow-soft">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-[#A17C5F] tracking-widest opacity-60">Order Placed</p>
                    <p className="font-bold text-[#3B1F0A]">{format(new Date(order.created_at), 'dd MMM, p')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839] shadow-soft">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-[#A17C5F] tracking-widest opacity-60">Payment Verified</p>
                    <p className="font-bold text-[#3B1F0A]">Secure Transaction</p>
                  </div>
                </div>
              </div>

              {/* Trust Micro-strip Architecture */}
              <div className="mt-12 pt-8 border-t border-[#FDF6EC] flex flex-wrap justify-center gap-6 opacity-30">
                 <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
                    <ShieldCheck size={10} /> Secure Box
                 </div>
                 <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
                    <Zap size={10} /> Fresh Bake
                 </div>
                 <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
                    <Star size={10} /> Elite Quality
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

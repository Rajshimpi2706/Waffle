'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { ShoppingBag, Calendar, Receipt, Phone, ArrowLeft, RefreshCcw, Star, ShieldCheck, Zap, Download, FileText, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';

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

  const handleDownloadReceipt = () => {
    window.print();
  };

  const paymentData: any = order.payment;
  const paymentProvider = (Array.isArray(paymentData) ? paymentData[0]?.provider : paymentData?.provider) || 'Online Payment';
  const totalSafe = order.total_amount ?? order.subtotal ?? 0;
  const itemsSafe = order.items || [];
  const placedTime = order.created_at ? format(new Date(order.created_at), 'dd MMM, p') : 'Processing...';

  return (
    <div className="bg-[#FDF6EC] min-h-screen print:bg-white print:min-h-0">
      
      {/* Print Only Header (Hidden on screen) */}
      <div className="hidden print:block text-center mb-8 pb-6 border-b-2 border-black border-dashed">
         <h1 className="text-4xl font-serif font-black text-black">Waffle Wala</h1>
         <p className="font-bold uppercase tracking-widest mt-2">{order.order_number}</p>
         <p className="text-sm mt-1">{placedTime}</p>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 lg:py-16 animate-fade-in print:py-0 print:px-0 print:max-w-none">
        
        {/* Premium Header Architecture (Hidden on print) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-16 relative print:hidden">
          <div className="space-y-4 lg:space-y-6">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-3 px-5 lg:px-6 py-2.5 bg-white border border-[#F5E6CC] text-[#3B1F0A] rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest shadow-soft hover:shadow-medium hover:-translate-x-1 transition-all"
            >
              <ArrowLeft size={16} />
              Return Storefront
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#3B1F0A] tracking-tighter">
                  Track <span className="text-[#C17839]">Order</span>
                </h1>
                {isPolling && <RefreshCcw size={20} className="text-[#C17839] animate-spin opacity-50" />}
              </div>
              <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] opacity-60">
                Protocol #{order.order_number}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0">
             <div className="bg-white p-3 lg:p-4 rounded-3xl shadow-soft border border-[#F5E6CC] flex items-center gap-3">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-[#22C55E] animate-pulse" />
                <div>
                   <p className="text-[9px] lg:text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-0.5">Live Updates</p>
                   <p className="text-[10px] lg:text-xs font-bold text-[#3B1F0A]">Refresh: {format(lastUpdated, 'HH:mm:ss')}</p>
                </div>
             </div>
          </div>
        </div>

        {/* 
          Mobile Priority Layout Request: 
          On mobile: Status > Order# > Total > CTA > Timeline > Receipt 
          To achieve this visually, we can use flex-col-reverse or grid ordering, 
          but actually the Receipt matches "Order# / Total / CTA", so putting the Receipt on top for Mobile is best.
        */}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Main Timeline (Bottom on mobile, Left on desktop) */}
          <div className="w-full lg:col-span-8 flex flex-col gap-8 print:hidden">
            <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-6 sm:p-10 lg:p-20 shadow-premium border border-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 lg:p-12 opacity-[0.03] pointer-events-none">
                  <Star size={250} className="text-[#3B1F0A]" />
               </div>
               <OrderTimeline order={order} />
            </div>

            {/* Support Micro-Card */}
            <div className="bg-[#3B1F0A] rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-medium relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-[#C17839]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="flex items-center gap-5 w-full sm:w-auto">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-[#C17839] shrink-0">
                     <Phone size={24} />
                  </div>
                  <div>
                     <h4 className="text-white text-lg lg:text-xl font-serif font-bold mb-1">Need assistance?</h4>
                     <p className="text-white/60 text-sm font-medium pr-4">Our concierge is ready to help.</p>
                  </div>
               </div>
               <a href="tel:+919876543210" className="w-full sm:w-auto text-center px-8 py-4 bg-white text-[#3B1F0A] font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95">
                  Call Support
               </a>
            </div>
          </div>

          {/* Order Summary Sidebar (Top on mobile, Right on desktop) */}
          <div className="w-full lg:col-span-4 lg:sticky lg:top-8 print:w-full print:block">
            
            <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-soft border border-[#F5E6CC] relative overflow-hidden print:border-none print:shadow-none print:p-0 print:rounded-none">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C17839]/10 print:hidden" />
              
              <div className="flex items-center justify-between mb-8 print:hidden">
                <h2 className="text-xl lg:text-2xl font-serif font-black text-[#3B1F0A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839]">
                    <FileText size={20} />
                  </div>
                  Receipt
                </h2>
                <OrderStatusBadge status={order.status as any} className="scale-90 origin-right" />
              </div>

              {/* Items List */}
              <div className="space-y-5 pb-6 mb-6 border-b max-w-full overflow-hidden border-dashed border-[#F5E6CC] print:border-black">
                 {itemsSafe.length === 0 && (
                   <p className="text-xs text-[#8B5E3C] italic text-center py-4">No items listed</p>
                 )}
                 {itemsSafe.map((item) => (
                   <div key={item.id} className="flex justify-between items-start gap-4 group">
                     <div className="flex-1 pr-4">
                       <p className="font-bold text-[#3B1F0A] text-sm lg:text-base leading-tight group-hover:text-[#C17839] transition-colors print:text-black">
                         {item.product_name}
                       </p>
                       <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-60 print:text-black">
                         Qty: {item.quantity || 1}
                       </p>
                     </div>
                     <p className="font-serif font-black text-[#3B1F0A] print:text-black mt-0.5">
                       {formatCurrency(item.line_total || 0)}
                     </p>
                   </div>
                 ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-[#8B5E3C] font-medium print:text-black print:text-sm">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-bold">{formatCurrency(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center bg-[#FDF6EC] p-5 rounded-2xl border border-[#F5E6CC] mt-4 print:bg-white print:border-t-2 print:border-b-2 print:border-l-0 print:border-r-0 print:border-black print:rounded-none px-0 print:px-0">
                  <span className="text-base lg:text-lg font-serif font-black text-[#3B1F0A] print:text-black">Total Paid</span>
                  <span className="text-xl lg:text-2xl font-serif font-black text-[#C17839] print:text-black">
                    {formatCurrency(totalSafe)}
                  </span>
                </div>
              </div>

              {/* Secure Info */}
              <div className="space-y-4 mb-8 print:block">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839] print:hidden">
                       <Calendar size={14} />
                     </div>
                     <p className="text-[10px] uppercase font-black text-[#A17C5F] tracking-widest opacity-60 print:text-black print:opacity-100">Date</p>
                   </div>
                   <p className="font-bold text-[#3B1F0A] text-sm print:text-black">{placedTime}</p>
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839] print:hidden">
                       <ShieldCheck size={14} />
                     </div>
                     <p className="text-[10px] uppercase font-black text-[#A17C5F] tracking-widest opacity-60 print:text-black print:opacity-100">Method</p>
                   </div>
                   <p className="font-bold capitalize text-[#3B1F0A] text-sm print:text-black">
                     {paymentProvider.replace(/_/g, ' ')}
                   </p>
                </div>
              </div>

              {/* Download CTA (Hidden on Mobile bottom, Top on Desktop? The rule says "Mobile priority layout: status > order > total > primary CTA > timeline > receipt". 
                  Because we forced Sidebar to top, it fulfills Order# and Total. We will show the CTA here) */}
              <div className="flex flex-col gap-3 print:hidden">
                {/* Visual friendly fallback note underneath */}
                <button 
                  onClick={handleDownloadReceipt}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 h-14 bg-[#3B1F0A] text-white font-black text-sm rounded-2xl hover:bg-black transition-all shadow-md active:scale-[0.98] group"
                >
                  <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                  Download Receipt
                </button>
                <p className="text-[9px] text-[#A17C5F] text-center italic font-medium px-4 leading-relaxed opacity-60">
                  Save a copy for your records. Print dialog will safely hide all non-receipt elements.
                </p>
              </div>

              {/* Print Only Footer */}
              <div className="hidden print:block text-center mt-12 pt-6 border-t border-dashed border-black">
                 <p className="font-serif font-black text-xl mb-2">Thank you!</p>
                 <p className="text-xs">We hope you enjoy your freshly baked waffles.</p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

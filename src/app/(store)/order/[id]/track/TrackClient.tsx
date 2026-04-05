'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { ArrowLeft, Map as MapIcon, Layers, Maximize, User, MapPin, Phone, MessageSquare, Download, CheckCircle2, Bike } from 'lucide-react';
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

  const fetchLatestStatus = useCallback(async () => {
    try {
      setIsPolling(true);
      const url = `/api/orders/${order.order_number}${phoneLast4 ? `?phone=${phoneLast4}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setOrder(result.data);
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

  const totalSafe = order.total_amount ?? order.subtotal ?? 0;
  const itemsSafe = order.items || [];
  const firstItem = itemsSafe[0];
  const placedTime = order.created_at ? format(new Date(order.created_at), 'dd MMM, p') : 'Processing...';

  return (
    <div className="bg-[#FDF6EC] min-h-screen text-[#3B1F0A] font-sans print:bg-white print:min-h-0">
      
      {/* Print Only Header */}
      <div className="hidden print:block text-center mb-8 pb-6 border-b-2 border-black border-dashed">
         <h1 className="text-4xl font-serif font-black text-black">Waffle Wala</h1>
         <p className="font-bold uppercase tracking-widest mt-2">{order.order_number}</p>
         <p className="text-sm mt-1">{placedTime}</p>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10 lg:py-12 print:hidden">
        
        {/* Top Back Button */}
        <div className="mb-8">
            <Link 
              href="/menu" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#523A28] rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-x-1 transition-all"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              Back to Storefront
            </Link>
        </div>

        {/* Main Grid Layout matching the Image */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10">
          
          {/* ======================= LEFT COLUMN ======================= */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6 lg:gap-8">
            
            {/* Hero Card + Timeline */}
            <div className="bg-gradient-to-br from-[#C49563] via-[#B58652] to-[#8C5D30] rounded-[2rem] p-8 lg:p-12 shadow-md relative overflow-hidden flex flex-col">
              {/* Subtle top curving lines effect from image could be simulated, but we keep it clean */}
              <div className="relative z-10 mb-8 sm:mb-12">
                <h1 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight mb-2">
                  Track Your Order
                </h1>
                <p className="text-white/80 text-xs sm:text-sm font-black uppercase tracking-[0.15em]">
                  Protocol #{'WW-' + order.order_number.replace(/\D/g, '').substring(0,8) + '-9007'}
                </p>
              </div>

              <div className="w-full mt-auto relative z-10">
                <OrderTimeline order={order} />
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col sm:flex-row gap-8 relative">
              <div className="absolute top-6 right-6 opacity-30 text-[#A17C5F]">
                 <span className="text-[10px] font-black uppercase tracking-widest bg-[#FDF6EC] px-3 py-1 rounded-full">Receipt</span>
              </div>
              
              <div className="w-full sm:w-1/2 flex flex-col justify-between pt-2">
                <h3 className="text-xl font-serif font-black mb-6">Order Summary</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FDF6EC] overflow-hidden shrink-0 border border-[#EAE0D5] relative flex items-center justify-center">
                    {/* Perfect placeholder for waffle */}
                    <img 
                      src="https://images.unsplash.com/photo-1562376552-0d160a2f9fa4?auto=format&fit=crop&q=80&w=300"
                      alt="Waffle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg leading-tight mb-1 text-[#3B1F0A]">{firstItem?.product_name || 'Classic Waffle'}</h4>
                    <div className="flex items-center justify-between mt-1 w-full gap-4">
                      <p className="text-[12px] font-black text-[#A17C5F] opacity-80">Qty: {firstItem?.quantity || 1}</p>
                      <p className="font-bold text-[#A17C5F] text-[13px]">{formatCurrency(firstItem?.line_total || totalSafe)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Divider (Desktop) / Horizontal (Mobile) */}
              <div className="w-full sm:w-px h-px sm:h-auto bg-[#EAE0D5] shrink-0" />

              <div className="w-full sm:w-1/2 flex flex-col justify-between">
                <div className="space-y-3 mb-6 pt-2">
                   <div className="flex justify-between items-center text-[#8B5E3C] text-[13px] font-medium">
                     <span>Subtotal</span>
                     <span className="font-bold">{formatCurrency(order.subtotal ?? 0)}</span>
                   </div>
                   <div className="flex justify-between items-center text-[#8B5E3C] text-[13px] font-medium">
                     <span>Delivery fee</span>
                     <span className="font-bold">{formatCurrency(order.delivery_fee || 20)}</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-dashed border-[#EAE0D5] pt-3 mt-1">
                     <span className="font-bold text-[#3B1F0A] text-[15px]">Total Paid</span>
                     <span className="font-black text-[#3B1F0A] text-lg">{formatCurrency(totalSafe)}</span>
                   </div>
                   <div className="flex justify-end pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF6EC] text-[#8B5E3C] rounded-full text-[10px] font-black uppercase tracking-widest">
                         <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center text-[#A17C5F]"><CheckCircle2 size={10} /></div>
                         Total
                      </span>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-[#EAE0D5] pt-6">
                   <div className="flex items-center gap-2 flex-1 w-full text-[13px] text-[#A17C5F]">
                      <MapPin size={16} className="shrink-0" />
                      <span className="truncate pr-2">Delivering to: <strong className="text-[#3B1F0A]">{order.customer_name}</strong></span>
                   </div>
                   <button 
                     onClick={handleDownloadReceipt}
                     className="w-full sm:w-auto px-6 py-3 bg-[#4A301E] text-white rounded-xl text-[12px] font-black flex items-center justify-center gap-2 hover:bg-black transition-colors"
                   >
                     <Download size={14} /> Download Receipt
                   </button>
                </div>
              </div>
            </div>
          </div>
          

          {/* ======================= RIGHT COLUMN ======================= */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 lg:gap-8">
            
            {/* Map Placeholder UI */}
            <div className="bg-[#F8F5F0] rounded-[2rem] w-full min-h-[300px] lg:h-[360px] relative overflow-hidden border border-[#EAE0D5] shadow-xs flex items-center justify-center pointer-events-none">
              {/* CSS Grid Pattern simulating Map */}
              <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#3B1F0A 1px, transparent 1px), linear-gradient(90deg, #3B1F0A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              
              {/* Road simulations */}
              <div className="absolute w-[200%] h-4 bg-white -rotate-12 inset-0 m-auto z-0 opacity-80" />
              <div className="absolute w-[200%] h-3 bg-white rotate-45 inset-0 m-auto z-0 opacity-80" />
              <div className="absolute w-[200%] h-6 bg-white rotate-0 top-[20%] z-0 opacity-80" />
              
              {/* Top Controls */}
              <div className="absolute top-6 left-6 z-10 flex bg-white rounded-lg shadow-sm overflow-hidden text-[11px] font-bold">
                <div className="px-4 py-2 bg-white text-[#3B1F0A] border-r border-gray-100">Map</div>
                <div className="px-4 py-2 bg-gray-50 text-gray-500">Satellite</div>
              </div>
              <div className="absolute top-6 right-6 z-10 w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-600">
                <Maximize size={14} />
              </div>

              {/* Bottom Right Controls */}
              <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-gray-600"><User size={14} /></div>
                <div className="w-8 h-16 bg-white rounded-lg shadow-sm flex flex-col">
                  <div className="flex-1 flex items-center justify-center border-b border-gray-100 text-gray-600 font-bold">+</div>
                  <div className="flex-1 flex items-center justify-center text-gray-600 font-bold">−</div>
                </div>
              </div>

              {/* Map Footer Label */}
              <div className="absolute bottom-2 right-12 z-10 text-[9px] text-gray-400 font-medium">Map data ©2026 Google  Terms of Use</div>

              {/* Driver Pin UI Bubble */}
              <div className="absolute z-20 flex flex-col items-center animate-bounce-slow" style={{ top: '35%', left: '45%' }}>
                 <div className="bg-white px-4 py-3 rounded-2xl shadow-md mb-2 flex flex-col items-center whitespace-nowrap">
                    <p className="text-[13px] font-black text-[#3B1F0A]">Delivery Driver</p>
                    <p className="text-[11px] font-medium text-[#A17C5F]">Estimated arrival at 3:30 PM</p>
                 </div>
                 {/* Pin Point */}
                 <div className="w-3 h-3 bg-white rotate-45 -mt-3 shadow-sm z-[-1]" />
                 
                 {/* Driver Avatar Circle on Map */}
                 <div className="w-14 h-14 bg-[#4A301E] rounded-full border-4 border-white shadow-lg mt-1 flex items-center justify-center text-white">
                    <Bike size={20} />
                 </div>
              </div>
            </div>

            {/* Delivery Info Card */}
            <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 flex flex-col sm:flex-row gap-6 shadow-sm border border-[#EAE0D5]">
               <div className="flex-1">
                 <h4 className="text-[14px] font-bold text-[#3B1F0A] mb-1">Delivery Driver</h4>
                 <p className="text-[12px] font-medium text-[#A17C5F]">Estimated arrival at<br/>3:30 PM</p>
               </div>
               <div className="w-px bg-[#EAE0D5] hidden sm:block" />
               <div className="flex-1">
                 <h4 className="text-[14px] font-bold text-[#3B1F0A] mb-1">Delivery Address</h4>
                 <p className="text-[12px] font-medium text-[#A17C5F] leading-relaxed">
                   {order.customer_name}<br/>
                   {(order as any).address?.line1 || '49 Main Street, Kecemancala'}
                 </p>
               </div>
            </div>

            {/* Support Agent Card */}
            <div className="bg-gradient-to-r from-[#C49563] to-[#8C5D30] rounded-[1.5rem] overflow-hidden flex shadow-sm relative">
               <div className="w-[120px] sm:w-[140px] shrink-0 bg-[#EAE0D5] relative overflow-hidden h-full min-h-[100px]">
                  {/* Stock rep image */}
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200" alt="Agent" className="w-full h-full object-cover scale-110 object-top" />
               </div>
               <div className="flex-1 p-5 lg:p-6 flex flex-col justify-center items-center">
                  <h4 className="text-white font-serif font-black text-lg mb-4 text-center">Need Assistance?</h4>
                  <div className="flex items-center gap-3 w-full justify-center">
                     <a href="tel:+919876543210" className="flex-1 bg-white text-[#4A301E] text-[11px] font-black uppercase tracking-widest py-2.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 hover:bg-gray-50 flex-nowrap whitespace-nowrap">
                        <Phone size={14} /> Direct Call
                     </a>
                     <button className="flex-1 border border-white/40 text-white text-[11px] font-black uppercase tracking-widest py-2.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 hover:bg-white/10 flex-nowrap whitespace-nowrap">
                        <MessageSquare size={14} /> Live Chat
                     </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Print Only Receipt Fallback Content */}
      <div className="hidden print:block max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="border border-black p-6">
          {itemsSafe.map(i => (
            <div key={i.id} className="flex justify-between mb-2">
              <span>{i.quantity}x {i.product_name}</span>
              <span>{formatCurrency(i.line_total || 0)}</span>
            </div>
          ))}
          <div className="border-t border-black mt-4 pt-4 flex justify-between font-bold">
             <span>Total</span>
             <span>{formatCurrency(totalSafe)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

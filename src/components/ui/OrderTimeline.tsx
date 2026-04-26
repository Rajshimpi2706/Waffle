'use client';
import React from 'react';
import { OrderStatus, Order } from '@/types';
import { Check, AlertCircle, ShoppingBag, ChefHat, Bike, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderTimelineProps {
  order: Order;
  className?: string;
}

const STEPS = [
  { id: 'confirmed', label: 'Order Placed', icon: ShoppingBag },
  { id: 'preparing', label: 'Preparing', icon: ChefHat },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { id: 'delivered', label: 'Delivered', icon: Gift },
];

export function OrderTimeline({ order, className }: OrderTimelineProps) {
  const currentStatus = order.status;
  const isCancelled = currentStatus === 'cancelled';
  
  const mappedStatus = currentStatus === 'pending' || currentStatus === 'confirmed' ? 'confirmed' :
                       currentStatus === 'preparing' ? 'preparing' :
                       currentStatus === 'ready' || currentStatus === 'out_for_delivery' ? 'out_for_delivery' :
                       currentStatus === 'delivered' ? 'delivered' : 'confirmed';

  const currentStepIndex = STEPS.findIndex(s => s.id === mappedStatus);

  if (isCancelled) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-center shadow-sm relative overflow-hidden min-h-[140px] sm:h-[180px] flex flex-col items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-lg sm:text-xl font-serif font-black text-red-900">Order Cancelled</h2>
        {order.cancelled_at && (
          <p className="text-[10px] text-red-500 uppercase tracking-widest mt-2 font-bold">
            {format(new Date(order.cancelled_at), 'dd MMM, p')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 sm:px-8 md:px-10 flex flex-col justify-center min-h-[140px] md:min-h-[180px] shadow-sm relative w-full border border-white overflow-x-hidden", className)}>
      <div className="relative flex items-start sm:items-center justify-between w-full mt-2 sm:mt-4">
        
        {/* Desktop Connecting Line */}
        <div className="absolute top-[24px] sm:top-[28px] left-[8%] right-[8%] h-1 bg-[#EAE0D5] z-0 rounded-full hidden sm:block" />
        <div className="absolute top-[24px] sm:top-[28px] left-[8%] h-1 bg-[#A17C5F] z-0 rounded-full transition-all duration-700 hidden sm:block" 
             style={{ width: `${(Math.max(currentStepIndex, 0) / (STEPS.length - 1)) * 84}%` }} />

        {/* Mobile vertical line */}
        <div className="absolute left-[28px] top-7 bottom-7 w-1 bg-[#EAE0D5] z-0 rounded-full sm:hidden" />
        <div className="absolute left-[28px] top-7 w-1 bg-[#A17C5F] z-0 rounded-full transition-all duration-700 sm:hidden" 
             style={{ height: `${(Math.max(currentStepIndex, 0) / (STEPS.length - 1)) * 100}%` }} />

        <div className="flex flex-col sm:flex-row justify-between w-full sm:w-[84%] mx-auto z-10 gap-5 sm:gap-0 relative">
          {STEPS.map((step, index) => {
            const isCompleted = currentStepIndex > index;
            const isCurrent = currentStepIndex === index;
            const isFuture = currentStepIndex < index;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex sm:flex-col items-center gap-3 sm:gap-3 group relative sm:w-[100px] md:w-[120px]">
                
                {/* Live Badge (desktop — above icon) */}
                {isCurrent && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1 opacity-90 animate-fade-in">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#A17C5F]" />
                     <span className="text-[10px] font-black tracking-widest uppercase text-[#A17C5F]">live</span>
                  </div>
                )}

                {/* State Node — smaller on mobile */}
                <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                   {isCompleted && (
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#B28B65] text-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all">
                       <Check size={18} strokeWidth={2.5} />
                     </div>
                   )}
                   
                   {isCurrent && (
                     <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#D1B191]/30 z-10">
                        <div className="absolute inset-0 rounded-full border-2 border-[#A17C5F]/30 animate-ping opacity-70" />
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#B28B65] text-white rounded-full flex items-center justify-center shadow-lg">
                           <Icon size={16} strokeWidth={2.5} />
                        </div>
                     </div>
                   )}

                   {isFuture && (
                     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-[#D9D0C5] border-2 border-[#EAE0D5] rounded-full flex items-center justify-center z-10">
                        <Check size={18} strokeWidth={2} />
                     </div>
                   )}
                </div>

                {/* Label */}
                <div className="flex-1 sm:flex-none sm:text-center">
                  {/* Mobile Live Badge */}
                  {isCurrent && (
                    <div className="sm:hidden flex items-center gap-1 mb-0.5 opacity-90">
                       <div className="w-1 h-1 rounded-full bg-[#A17C5F]" />
                       <span className="text-[9px] font-black tracking-widest uppercase text-[#A17C5F]">live</span>
                    </div>
                  )}
                  <p className={cn(
                    "text-[11px] sm:text-[13px] md:text-[14px] font-bold tracking-[0.02em] leading-tight",
                    isCurrent || isCompleted ? "text-[#3B1F0A]" : "text-[#B5AAA0] font-medium"
                  )}>
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

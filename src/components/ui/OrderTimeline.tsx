import React from 'react';
import { OrderStatus, Order } from '@/types';
import { Check, Clock, ChefHat, Bike, Package, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  order: Order;
  className?: string;
}

interface TimelineStep {
  id: OrderStatus;
  label: string;
  reassurance: string;
  icon: React.ElementType;
}

const STEPS: TimelineStep[] = [
  { 
    id: 'confirmed', 
    label: 'Order Confirmed', 
    reassurance: 'Our chefs are getting ready to bake.',
    icon: Check 
  },
  { 
    id: 'preparing', 
    label: 'Preparing', 
    reassurance: 'Your waffle is being freshly prepared.', 
    icon: ChefHat 
  },
  { 
    id: 'ready', 
    label: 'Order Ready', 
    reassurance: 'Packing carefully for dispatch.', 
    icon: Package 
  },
  { 
    id: 'out_for_delivery', 
    label: 'On the Way', 
    reassurance: 'Our rider has left the store.', 
    icon: Bike 
  },
  { 
    id: 'delivered', 
    label: 'Delivered', 
    reassurance: 'Enjoy your delicious waffles!', 
    icon: Check 
  },
];

export function OrderTimeline({ order, className }: OrderTimelineProps) {
  const currentStatus = order.status;
  const isCancelled = currentStatus === 'cancelled';
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStatus);

  if (isCancelled) {
    return (
      <div className="bg-red-50/50 p-12 rounded-[3.5rem] border border-red-100 text-center animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500/20" />
        <div className="w-20 h-20 bg-white shadow-soft text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif font-black text-red-900 mb-4 tracking-tight">Order Cancelled</h2>
        <p className="text-red-700/70 font-medium italic max-w-sm mx-auto leading-relaxed">
          "This order has been cancelled. If any payment was processed, it will be refunded within 3-5 business days."
        </p>
        {order.cancelled_at && (
          <div className="mt-8 pt-6 border-t border-red-100 inline-block">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">
              Cancellation Logged: {format(new Date(order.cancelled_at), 'dd MMM yyyy, p')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-12", className)}>
      {/* Current Status Message Architecture */}
      <div className="text-center mb-16 relative">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-[#FDF6EC] text-[#3B1F0A] rounded-full text-xs font-black uppercase tracking-[0.2em] border border-[#F5E6CC] mb-6 shadow-soft">
          <div className="w-2 h-2 rounded-full bg-[#C17839] animate-pulse" />
          Live Status
        </div>
        <h2 className="text-4xl lg:text-5xl font-serif font-black text-[#3B1F0A] mb-4 tracking-tighter">
          {currentStatus === 'pending' ? 'Order Processing' : (STEPS[currentStepIndex]?.label || currentStatus)}
        </h2>
        <p className="text-[#8B5E3C] max-w-md mx-auto font-medium italic opacity-70">
          {currentStatus === 'pending' 
            ? "We've received your order and our chefs are being notified."
            : STEPS[currentStepIndex]?.reassurance || "Baking happiness just for you..."}
        </p>
      </div>

      <div className="relative pt-8 pb-8">
        {/* Modernized Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FDF6EC] via-[#F5E6CC] to-[#FDF6EC] -z-10 md:left-1/2 md:-ml-0.5 rounded-full" />

        <div className="space-y-16 lg:space-y-24">
          {STEPS.map((step, index) => {
            const isCompleted = currentStepIndex >= index;
            const isCurrent = currentStepIndex === index;
            const Icon = step.icon;
            
            // Map step ID to the timestamp column
            const timestamp = (order as any)[`${step.id}_at`];

            return (
              <div key={step.id} className="relative flex items-center md:justify-center gap-8 group">
                
                {/* Desktop Left Side (Time Architecture) */}
                <div className="hidden md:block w-1/2 text-right pr-20">
                  {timestamp && (
                    <div className="group-hover:-translate-x-1 transition-transform duration-500">
                      <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1 opacity-50">Logged Time</p>
                      <p className="text-xl font-serif font-black text-[#3B1F0A]">
                        {format(new Date(timestamp), 'h:mm a')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Center High-End Icon Circle */}
                <div className={cn(
                  "relative z-10 w-16 h-16 rounded-[2rem] flex items-center justify-center flex-shrink-0 transition-all duration-700 border-4 border-white shadow-soft",
                  isCurrent ? "bg-[#C17839] text-white shadow-premium scale-110 -rotate-3" : 
                  isCompleted ? "bg-[#3B1F0A] text-[#E8A535]" : 
                  "bg-white text-gray-200 border-[#FDF6EC]"
                )}>
                  <Icon size={isCurrent ? 28 : 22} strokeWidth={isCurrent ? 2.5 : 2} />
                  
                  {isCurrent && (
                    <>
                      <span className="absolute inset-0 rounded-[2rem] border-2 border-[#C17839] animate-ping opacity-20" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
                         <div className="w-full h-full bg-[#22C55E] rounded-full animate-pulse" />
                      </div>
                    </>
                  )}
                </div>

                {/* Right Side (Label & Description) */}
                <div className="flex-1 md:w-1/2 md:flex-none md:pl-20">
                  <h3 className={cn(
                    "text-2xl font-serif font-bold transition-all duration-500",
                    isCurrent ? "text-[#C17839] translate-x-1" :
                    isCompleted ? "text-[#3B1F0A]" :
                    "text-gray-300"
                  )}>
                    {step.label}
                  </h3>
                  
                  {/* Mobile Time Architecture */}
                  {timestamp && (
                    <p className="md:hidden text-[10px] font-black text-[#C17839] uppercase tracking-widest mt-1 mb-2">
                       {format(new Date(timestamp), 'h:mm a')}
                    </p>
                  )}

                  {(isCurrent || isCompleted) && (
                    <p className={cn(
                      "text-sm font-medium mt-2 max-w-xs leading-relaxed",
                      isCurrent ? "text-[#8B5E3C] opacity-80" : "text-[#8B5E3C] opacity-40 italic"
                    )}>
                      {step.reassurance}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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
      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-red-900 mb-2">Order Cancelled</h2>
        <p className="text-red-700">This order has been cancelled. If payment was made, a refund will be processed.</p>
        {order.cancelled_at && (
          <p className="text-red-600/70 text-sm mt-4">
            Cancelled at: {format(new Date(order.cancelled_at), 'dd MMM yyyy, h:mm a')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Current Status Message */}
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-1.5 bg-amber-50 text-[#C17839] rounded-full text-sm font-bold border border-amber-100 mb-2">
          {currentStatus === 'pending' ? 'Status: Waiting for Confirmation' : `Status: ${STEPS[currentStepIndex]?.label || currentStatus}`}
        </div>
        <p className="text-gray-500 italic">
          {currentStatus === 'pending' 
            ? "We've received your order and are confirming it."
            : STEPS[currentStepIndex]?.reassurance || "Tracking your order progress..."}
        </p>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100 -z-10 md:left-1/2 md:-ml-px"></div>

        <div className="space-y-12">
          {STEPS.map((step, index) => {
            const isCompleted = currentStepIndex >= index;
            const isCurrent = currentStepIndex === index;
            const Icon = step.icon;
            
            // Map step ID to the timestamp column
            const timestamp = (order as any)[`${step.id}_at`];

            return (
              <div key={step.id} className="relative flex items-center md:justify-center gap-6 group">
                
                {/* Desktop Left Side (Time) */}
                <div className="hidden md:block w-1/2 text-right pr-12">
                  {timestamp && (
                    <div className="text-sm text-[#8B5E3C] font-semibold bg-[#FDF6EC] inline-block px-3 py-1 rounded-lg border border-[#F5E6CC]">
                      {format(new Date(timestamp), 'h:mm a')}
                    </div>
                  )}
                </div>

                {/* Center Icon Circle */}
                <div className={cn(
                  "relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 border-4 border-white",
                  isCurrent ? "bg-[#C17839] text-white shadow-lg scale-110" : 
                  isCompleted ? "bg-[#3B1F0A] text-[#E8A535]" : 
                  "bg-gray-100 text-gray-400"
                )}>
                  <Icon size={isCurrent ? 24 : 20} strokeWidth={isCompleted ? 2.5 : 2} />
                  
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-[#C17839] animate-ping opacity-30"></span>
                  )}
                </div>

                {/* Right Side (Label & Mobile Time) */}
                <div className="flex-1 md:w-1/2 md:flex-none md:pl-12">
                  <h3 className={cn(
                    "text-lg font-bold transition-colors",
                    isCurrent ? "text-[#C17839]" :
                    isCompleted ? "text-[#3B1F0A]" :
                    "text-gray-400"
                  )}>
                    {step.label}
                  </h3>
                  
                  {/* Mobile Time */}
                  {timestamp && (
                    <p className="md:hidden text-xs text-[#8B5E3C] font-bold mt-1 bg-[#FDF6EC] w-fit px-2 py-0.5 rounded border border-[#F5E6CC]">
                      {format(new Date(timestamp), 'h:mm a')}
                    </p>
                  )}

                  {isCurrent && (
                    <p className="text-sm text-gray-500 mt-1 max-w-xs">{step.reassurance}</p>
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

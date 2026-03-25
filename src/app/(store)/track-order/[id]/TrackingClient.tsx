'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, ChefHat, Bike, Package, AlertCircle } from 'lucide-react';
import { subscribeToOrderUpdates } from '@/lib/realtime';
import { format } from 'date-fns';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';

interface TrackingClientProps {
  initialOrder: any;
}

const steps = [
  { id: 'confirmed', label: 'Order Confirmed', icon: Check },
  { id: 'preparing', label: 'Preparing', icon: ChefHat },
  { id: 'ready', label: 'Baking Complete', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Bike },
  { id: 'delivered', label: 'Delivered', icon: Check },
];

export function TrackingClient({ initialOrder }: TrackingClientProps) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    // Subscribe to DB changes for this order ID
    const unsubscribe = subscribeToOrderUpdates(order.id, (newPayload) => {
      setOrder(newPayload);
    });

    return () => {
      unsubscribe();
    };
  }, [order.id]);

  const currentStatusIndex = steps.findIndex(s => s.id === order.order_status);
  const isCancelled = order.order_status === 'cancelled' || order.order_status === 'refunded';

  if (isCancelled) {
    return (
      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-red-900 mb-2">Order Cancelled</h2>
        <p className="text-red-700">This order has been cancelled. If you have been charged, a refund will be initiated shortly.</p>
        {order.cancelled_at && (
          <p className="text-red-600/70 text-sm mt-4">Cancelled at: {format(new Date(order.cancelled_at), 'p, PPP')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-[#F5E6CC] animate-fade-in relative overflow-hidden">
      
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#C17839]"></div>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#3B1F0A] mb-2 border-b border-[#F5E6CC] pb-4 inline-block">Order Status</h2>
        <p className="text-[#C17839] font-medium text-lg capitalize tracking-wide mt-4">
          {order.order_status.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#F5E6CC] -z-10 md:left-1/2 md:-ml-[1px]"></div>

        <div className="space-y-10">
          {steps.map((step, index) => {
            const isCompleted = currentStatusIndex >= index;
            const isCurrent = currentStatusIndex === index;
            const Icon = step.icon;
            
            // Map step ID to the timestamp column
            const timeField = `${step.id}_at` as keyof typeof order;
            const timestamp = order[timeField];

            return (
              <div key={step.id} className="relative flex items-center md:justify-center gap-6 group">
                
                {/* Desktop Left Side (Time) */}
                <div className="hidden md:block w-1/2 text-right pr-12">
                  {timestamp && (
                    <div className="text-sm text-[#8B5E3C] font-mono bg-[#FDF6EC] inline-block px-3 py-1 rounded-lg border border-[#F0E0C8]">
                      {format(new Date(timestamp), 'h:mm a')}
                    </div>
                  )}
                </div>

                {/* Center Icon */}
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 border-4 border-white ${
                  isCurrent ? 'bg-[#C17839] text-white shadow-lg scale-110 shadow-[#C17839]/30' : 
                  isCompleted ? 'bg-[#3B1F0A] text-[#E8A535]' : 
                  'bg-[#F5E6CC] text-[#C4A882]'
                }`}>
                  <Icon size={isCurrent ? 24 : 20} strokeWidth={isCompleted ? 2.5 : 2} />
                  
                  {/* Ping animation for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-[#C17839] animate-ping opacity-30"></span>
                  )}
                </div>

                {/* Right Side (Label & Mobile Time) */}
                <div className="flex-1 md:w-1/2 md:flex-none md:pl-12">
                  <h3 className={`text-lg font-medium transition-colors ${
                    isCurrent ? 'text-[#C17839] font-bold' :
                    isCompleted ? 'text-[#3B1F0A]' :
                    'text-[#C4A882]'
                  }`}>
                    {step.label}
                  </h3>
                  
                  {/* Mobile Time */}
                  {timestamp && (
                    <p className="md:hidden text-sm text-[#8B5E3C] font-mono mt-1 w-fit bg-[#FDF6EC] px-2 py-0.5 rounded border border-[#F0E0C8]">
                      {format(new Date(timestamp), 'h:mm a')}
                    </p>
                  )}

                  {/* Pending Description */}
                  {isCurrent && index === 0 && <p className="text-sm text-[#8B5E3C] mt-2">Kitchen is reviewing your order.</p>}
                  {isCurrent && index === 1 && <p className="text-sm text-[#8B5E3C] mt-2">Baking your waffles fresh.</p>}
                  {isCurrent && index === 2 && <p className="text-sm text-[#8B5E3C] mt-2">Packing carefuly for dispatch.</p>}
                  {isCurrent && index === 3 && <p className="text-sm text-[#8B5E3C] mt-2">Rider is on the way to you.</p>}
                  {isCurrent && index === 4 && <p className="text-sm text-[#8B5E3C] mt-2">Enjoy your waffles!</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}

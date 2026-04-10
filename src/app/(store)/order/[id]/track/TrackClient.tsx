'use client';

import { useState, useEffect, useRef } from 'react';
import { Order } from '@/types';
import { ArrowLeft, MapPin, Phone, MessageSquare, Download, CheckCircle2, Bike, ShoppingBag, ChefHat, Gift, Check, AlertCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TrackClientProps {
  initialOrder: Order;
  phoneLast4?: string | null;
}

// ─── Timeline Steps ───────────────────────────────────────────────
const STEPS = [
  { id: 'confirmed',        label: 'Order Placed',      icon: ShoppingBag, emoji: '🛒' },
  { id: 'preparing',        label: 'Preparing',          icon: ChefHat,     emoji: '👨‍🍳' },
  { id: 'out_for_delivery', label: 'Out for Delivery',  icon: Bike,        emoji: '🛵' },
  { id: 'delivered',        label: 'Delivered',          icon: Gift,        emoji: '🎁' },
];

function mapStatusToStep(status: string): string {
  if (status === 'pending' || status === 'confirmed') return 'confirmed';
  if (status === 'preparing' || status === 'ready')   return 'preparing';
  if (status === 'out_for_delivery')                   return 'out_for_delivery';
  if (status === 'delivered')                         return 'delivered';
  return 'confirmed';
}

// ─── Status Config ────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; message: string }> = {
  pending:          { label: 'Pending',          color: 'text-yellow-700', bg: 'bg-yellow-100', message: 'Your order is waiting to be confirmed.' },
  confirmed:        { label: 'Confirmed',        color: 'text-blue-700',   bg: 'bg-blue-100',   message: 'Great! Your order has been confirmed.' },
  preparing:        { label: 'Preparing',        color: 'text-orange-700', bg: 'bg-orange-100', message: 'Our chef is preparing your waffles! 🧇' },
  ready:            { label: 'Ready',            color: 'text-purple-700', bg: 'bg-purple-100', message: 'Your order is ready and will be picked up soon.' },
  out_for_delivery: { label: 'On the Way!',      color: 'text-indigo-700', bg: 'bg-indigo-100', message: 'Your waffles are on their way to you! 🛵' },
  delivered:        { label: 'Delivered ✓',     color: 'text-green-700',  bg: 'bg-green-100',  message: 'Enjoy your waffles! 🎉 Thank you for ordering.' },
  cancelled:        { label: 'Cancelled',        color: 'text-red-700',    bg: 'bg-red-100',    message: 'This order has been cancelled.' },
};

// ─── Timeline Component ───────────────────────────────────────────
function LiveTimeline({ status, justUpdated }: { status: string; justUpdated: boolean }) {
  const isCancelled = status === 'cancelled';
  const mappedStatus = mapStatusToStep(status);
  const currentStepIndex = STEPS.findIndex(s => s.id === mappedStatus);

  if (isCancelled) {
    return (
      <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 min-h-[160px]">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-serif font-black text-red-800">Order Cancelled</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 sm:px-10 flex flex-col justify-center min-h-[180px] shadow-sm border border-white/50 relative overflow-hidden">
      {/* Flash effect on update */}
      {justUpdated && (
        <div className="absolute inset-0 bg-amber-100/60 animate-ping rounded-[2rem] pointer-events-none" style={{ animationDuration: '0.8s', animationIterationCount: 1 }} />
      )}

      <div className="relative flex items-center justify-between w-full mt-4">
        {/* Background track line */}
        <div className="absolute top-[28px] left-[10%] right-[10%] h-1.5 bg-[#EAE0D5] z-0 rounded-full hidden sm:block" />
        {/* Animated progress fill */}
        <div
          className="absolute top-[28px] left-[10%] h-1.5 bg-gradient-to-r from-[#C17839] to-[#8B5E3C] z-0 rounded-full hidden sm:block transition-all duration-1000 ease-in-out"
          style={{ width: `${(Math.max(currentStepIndex, 0) / (STEPS.length - 1)) * 80}%` }}
        />

        <div className="flex flex-col sm:flex-row justify-between w-full sm:w-[90%] mx-auto z-10 gap-8 sm:gap-0 relative">
          {STEPS.map((step, index) => {
            const isCompleted = currentStepIndex > index;
            const isCurrent   = currentStepIndex === index;
            const isFuture    = currentStepIndex < index;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 relative sm:w-[120px]">
                {/* Live badge */}
                {isCurrent && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C17839] animate-pulse" />
                    <span className="text-[11px] font-black tracking-widest uppercase text-[#C17839]">live</span>
                  </div>
                )}

                {/* Node */}
                <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                  {isCompleted && (
                    <div className="w-12 h-12 bg-[#C17839] text-white rounded-full flex items-center justify-center shadow-md transition-all duration-500">
                      <Check size={22} strokeWidth={2.5} />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-full">
                      <div className="absolute inset-0 rounded-full bg-[#C17839]/20 animate-ping" />
                      <div className="absolute inset-0 rounded-full bg-[#C17839]/10" />
                      <div className="w-10 h-10 bg-[#C17839] text-white rounded-full flex items-center justify-center shadow-lg z-10">
                        <Icon size={18} strokeWidth={2.5} />
                      </div>
                    </div>
                  )}
                  {isFuture && (
                    <div className="w-12 h-12 bg-white text-[#D9D0C5] border-2 border-[#EAE0D5] rounded-full flex items-center justify-center">
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 sm:flex-none sm:text-center pt-1 sm:pt-0">
                  {isCurrent && (
                    <div className="sm:hidden flex items-center gap-1 mb-0.5">
                      <div className="w-1 h-1 rounded-full bg-[#C17839] animate-pulse" />
                      <span className="text-[9px] font-black tracking-widest uppercase text-[#C17839]">live</span>
                    </div>
                  )}
                  <p className={cn(
                    'text-[13px] sm:text-[14px] font-bold tracking-tight whitespace-nowrap',
                    isCurrent ? 'text-[#C17839]' : isCompleted ? 'text-[#3B1F0A]' : 'text-[#C0B5AB] font-medium'
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

// ─── Main TrackClient ─────────────────────────────────────────────
export function TrackClient({ initialOrder, phoneLast4 }: TrackClientProps) {
  const [order, setOrder]             = useState<Order>(initialOrder);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevStatus                    = useRef(initialOrder.status);

  const totalSafe  = order.total_amount ?? order.subtotal ?? 0;
  const itemsSafe  = order.items || [];
  const firstItem  = itemsSafe[0];
  const placedTime = order.created_at ? format(new Date(order.created_at), 'dd MMM, p') : '—';
  const cfg        = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];

  // ── Polling without Supabase Subscription ──────────────────────────────
  useEffect(() => {
    const fetchLatestStatus = async () => {
      try {
        // Use order.id (UUID) to bypass the phone verification check in the API
        // Add cache busting and cache: 'no-store' to ensure we get live data from the server, 
        // mitigating Next.js Client Route Cache and browser fetch caching.
        const res = await fetch(`/api/orders/${order.id}?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            const updated = result.data as Order;
            if (updated.status !== prevStatus.current) {
              prevStatus.current = updated.status;
              setOrder(prev => ({ ...prev, ...updated }));
              
              setJustUpdated(true);
              setTimeout(() => setJustUpdated(false), 1200);

              const newCfg = STATUS_CONFIG[updated.status];
              toast.success(newCfg?.message || `Order updated: ${updated.status}`, {
                icon: '🧇',
                duration: 5000,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll order status:', err);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(fetchLatestStatus, 5000);
    return () => clearInterval(interval);
  }, [order.id]);

  const handleDownloadReceipt = () => window.print();

  return (
    <div className="bg-[#FDF6EC] min-h-screen text-[#3B1F0A] font-sans print:bg-white print:min-h-0">

      {/* Print Header */}
      <div className="hidden print:block text-center mb-8 pb-6 border-b-2 border-black border-dashed">
        <h1 className="text-4xl font-serif font-black">Waffle Wala</h1>
        <p className="font-bold uppercase tracking-widest mt-2">{order.order_number}</p>
        <p className="text-sm mt-1">{placedTime}</p>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-10 lg:py-12 print:hidden">

        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#523A28] rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:-translate-x-1 transition-all"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Back to Storefront
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 xl:gap-10">

          {/* ═══ LEFT COLUMN ═══════════════════════════════════════════ */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6 lg:gap-8">

            {/* Hero Card + Timeline */}
            <div className="bg-gradient-to-br from-[#C49563] via-[#B58652] to-[#8C5D30] rounded-[2rem] p-8 lg:p-10 shadow-md relative overflow-hidden">

              {/* Status badge overlay */}
              <div className={cn(
                'absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500',
                cfg.bg, cfg.color
              )}>
                {justUpdated && <Sparkles size={12} className="animate-spin" />}
                {cfg.label}
              </div>

              <div className="relative z-10 mb-8">
                <h1 className="text-4xl sm:text-5xl font-serif font-black text-white tracking-tight mb-1">
                  Track Your Order
                </h1>
                <p className="text-white/70 text-xs font-black uppercase tracking-[0.15em]">
                  #{order.order_number} · Placed {placedTime}
                </p>
              </div>

              {/* Status message */}
              <div className={cn(
                'mb-6 px-4 py-3 rounded-2xl transition-all duration-700',
                cfg.bg
              )}>
                <p className={cn('text-[13px] font-bold', cfg.color)}>{cfg.message}</p>
              </div>

              <div className="w-full relative z-10">
                <LiveTimeline status={order.status} justUpdated={justUpdated} />
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm flex flex-col sm:flex-row gap-8 relative">
              <div className="absolute top-6 right-6">
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#FDF6EC] px-3 py-1 rounded-full text-[#A17C5F] opacity-60">Receipt</span>
              </div>

              <div className="w-full sm:w-1/2 flex flex-col justify-between pt-2">
                <h3 className="text-xl font-serif font-black mb-6">Order Summary</h3>
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FDF6EC] overflow-hidden shrink-0 border border-[#EAE0D5]">
                    <img
                      src="https://images.unsplash.com/photo-1562376552-0d160a2f9fa4?auto=format&fit=crop&q=80&w=300"
                      alt="Waffle"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg leading-tight mb-1">
                      {firstItem?.product_name || 'Waffle Order'}
                    </h4>
                    <p className="text-[12px] font-black text-[#A17C5F] opacity-80">Qty: {firstItem?.quantity || 1}</p>
                    <p className="font-bold text-[#A17C5F] text-[13px] mt-1">
                      {formatCurrency(firstItem?.line_total || totalSafe)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-px h-px sm:h-auto bg-[#EAE0D5] shrink-0" />

              <div className="w-full sm:w-1/2 flex flex-col justify-between">
                <div className="space-y-3 mb-6 pt-2">
                  <div className="flex justify-between text-[#8B5E3C] text-[13px] font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatCurrency(order.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-[#8B5E3C] text-[13px] font-medium">
                    <span>Delivery fee</span>
                    <span className="font-bold">{formatCurrency(order.delivery_fee || 20)}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-[#EAE0D5] pt-3 mt-1">
                    <span className="font-bold text-[#3B1F0A] text-[15px]">Total Paid</span>
                    <span className="font-black text-[#3B1F0A] text-lg">{formatCurrency(totalSafe)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-[#EAE0D5] pt-6">
                  <div className="flex items-center gap-2 flex-1 w-full text-[13px] text-[#A17C5F]">
                    <MapPin size={16} className="shrink-0" />
                    <span className="truncate">Delivering to: <strong className="text-[#3B1F0A]">{order.customer_name}</strong></span>
                  </div>
                  <button
                    onClick={handleDownloadReceipt}
                    className="w-full sm:w-auto px-6 py-3 bg-[#4A301E] text-white rounded-xl text-[12px] font-black flex items-center justify-center gap-2 hover:bg-black transition-colors"
                  >
                    <Download size={14} /> Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ══════════════════════════════════════════ */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 lg:gap-8">

            {/* Map placeholder */}
            <div className="bg-[#F8F5F0] rounded-[2rem] w-full min-h-[300px] lg:h-[360px] relative overflow-hidden border border-[#EAE0D5] shadow-xs flex items-center justify-center pointer-events-none">
              <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#3B1F0A 1px, transparent 1px), linear-gradient(90deg, #3B1F0A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <div className="absolute w-[200%] h-4 bg-white -rotate-12 inset-0 m-auto z-0 opacity-80" />
              <div className="absolute w-[200%] h-3 bg-white rotate-45 inset-0 m-auto z-0 opacity-80" />
              <div className="absolute w-[200%] h-6 bg-white rotate-0 top-[20%] z-0 opacity-80" />

              <div className="absolute top-6 left-6 z-10 flex bg-white rounded-lg shadow-sm overflow-hidden text-[11px] font-bold">
                <div className="px-4 py-2 text-[#3B1F0A] border-r border-gray-100">Map</div>
                <div className="px-4 py-2 bg-gray-50 text-gray-500">Satellite</div>
              </div>

              <div className="absolute z-20 flex flex-col items-center" style={{ top: '35%', left: '42%' }}>
                <div className="bg-white px-4 py-3 rounded-2xl shadow-md mb-2 flex flex-col items-center whitespace-nowrap">
                  <p className="text-[13px] font-black text-[#3B1F0A]">Delivery Driver</p>
                  <p className="text-[11px] font-medium text-[#A17C5F]">En route to you</p>
                </div>
                <div className="w-3 h-3 bg-white rotate-45 -mt-3 shadow-sm z-[-1]" />
                <div className="w-14 h-14 bg-[#C17839] rounded-full border-4 border-white shadow-lg mt-1 flex items-center justify-center text-white">
                  <Bike size={20} />
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 flex flex-col sm:flex-row gap-6 shadow-sm border border-[#EAE0D5]">
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-[#3B1F0A] mb-1">Delivery Driver</h4>
                <p className="text-[12px] font-medium text-[#A17C5F]">Estimated arrival soon</p>
              </div>
              <div className="w-px bg-[#EAE0D5] hidden sm:block" />
              <div className="flex-1">
                <h4 className="text-[14px] font-bold text-[#3B1F0A] mb-1">Delivery Address</h4>
                <p className="text-[12px] font-medium text-[#A17C5F] leading-relaxed">
                  {order.customer_name}<br />
                  {(order as any).shipping_address?.line1 || (order as any).address?.line1 || 'Your location'}
                </p>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-[#C49563] to-[#8C5D30] rounded-[1.5rem] overflow-hidden flex shadow-sm">
              <div className="w-[120px] sm:w-[140px] shrink-0 bg-[#EAE0D5] relative overflow-hidden min-h-[120px]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                  alt="Support Agent"
                  className="w-full h-full object-cover object-top scale-110"
                />
              </div>
              <div className="flex-1 p-5 lg:p-6 flex flex-col justify-center items-center">
                <h4 className="text-white font-serif font-black text-lg mb-4 text-center">Need Assistance?</h4>
                <div className="flex items-center gap-3 w-full justify-center">
                  <a
                    href="tel:+919876543210"
                    className="flex-1 bg-white text-[#4A301E] text-[11px] font-black uppercase tracking-widest py-2.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 hover:bg-gray-50 whitespace-nowrap"
                  >
                    <Phone size={14} /> Call
                  </a>
                  <button className="flex-1 border border-white/40 text-white text-[11px] font-black uppercase tracking-widest py-2.5 px-3 rounded-lg text-center flex items-center justify-center gap-1.5 hover:bg-white/10 whitespace-nowrap">
                    <MessageSquare size={14} /> Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Print receipt fallback */}
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

import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Calendar, Phone, ArrowRight, ShieldCheck, Zap, Star, Coffee, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { OrderStatusBadge } from '@/components/ui/OrderStatusBadge';

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  const supabase = await createServiceClient();

  // Fetch order details with joined items and payment
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), payment:payments(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return notFound();
  }

  const itemsCount = order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
  
  const paymentData: any = order.payment;
  const paymentStatus = (Array.isArray(paymentData) ? paymentData[0]?.status : paymentData?.status) || 'paid';
  
  const totalSafe = order.total_amount ?? order.subtotal ?? 0;

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-16 lg:py-24 animate-fade-in relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C17839]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#3B1F0A]/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full px-4 relative z-10 flex flex-col items-center">
        
        {/* Core Success Animation / Hero */}
        <div className="relative mb-8 mt-4 group">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center shadow-premium group-hover:scale-105 transition-transform duration-700 animate-slide-up">
            <CheckCircle2 className="text-[#22C55E]" size={64} strokeWidth={2} />
          </div>
          {/* Subtle confetti elements */}
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#FDF6EC] rounded-full flex items-center justify-center text-[#C17839] shadow-soft animate-bounce delay-100 border border-[#F5E6CC]">
            <Star size={18} fill="currentColor" />
          </div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#3B1F0A] rounded-full flex items-center justify-center text-white shadow-soft animate-bounce delay-300">
            <Coffee size={14} />
          </div>
        </div>

        <div className="text-center mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black text-[#3B1F0A] mb-4 tracking-tighter">
            🎉 Order Confirmed!
          </h1>
          <p className="text-[#8B5E3C] text-lg sm:text-xl font-medium italic max-w-lg mx-auto opacity-80 leading-relaxed px-4">
            "Your waffle is being prepared with love ❤️"
          </p>
        </div>

        {/* Compact Order Summary Card */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-premium border border-[#F5E6CC] overflow-hidden mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {/* Header Row */}
          <div className="bg-[#FDF6EC]/40 p-6 sm:p-8 flex items-center justify-between border-b border-[#F5E6CC]">
             <div>
               <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.2em] mb-1">Protocol Identifier</p>
               <p className="text-lg sm:text-2xl font-serif font-black text-[#3B1F0A]">{order.order_number}</p>
             </div>
             <div className="text-right">
               <OrderStatusBadge status={order.status as any} />
             </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
               <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-2 opacity-70">Amount Paid</p>
                  <p className="text-2xl font-serif font-black text-[#C17839]">{formatCurrency(totalSafe)}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-2 opacity-70">Payment State</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 capitalize">
                    <CheckCircle2 size={12} />
                    {paymentStatus}
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-2 opacity-70">Items</p>
                  <div className="flex items-center gap-2 text-[#3B1F0A] font-bold">
                    <Package size={16} className="text-[#C17839]" />
                    {itemsCount} {itemsCount === 1 ? 'Waffle' : 'Waffles'}
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-2 opacity-70">Time Placed</p>
                  <div className="flex items-center gap-2 text-[#3B1F0A] font-bold text-sm">
                    <Calendar size={14} className="text-[#C17839]" />
                    {order.created_at ? format(new Date(order.created_at), 'p') : 'Just now'}
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Primary & Secondary Actions */}
        <div className="flex flex-col w-full sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Link 
            href={`/order/${order.id}/track`} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 h-16 bg-[#C17839] text-white font-black text-lg rounded-[1.5rem] hover:bg-[#A8662D] hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all w-full sm:w-auto"
          >
            Track Your Order
            <ArrowRight size={20} />
          </Link>
          <Link 
            href="/menu" 
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 h-16 bg-white text-[#3B1F0A] font-black text-lg rounded-[1.5rem] border-2 border-[#F5E6CC] hover:bg-[#FDF6EC] hover:shadow-soft active:scale-95 transition-all w-full sm:w-auto"
          >
            Order More
          </Link>
        </div>

        {/* Trust Flags */}
        <div className="mt-16 pt-8 border-t border-[#E8D1B3] flex flex-wrap justify-center gap-8 w-full max-w-sm sm:max-w-none opacity-60 animate-fade-in" style={{ animationDelay: '400ms' }}>
           <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#8B5E3C]">
              <ShieldCheck size={16} /> Secure Payment
           </div>
           <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#8B5E3C]">
              <Zap size={16} /> Fast Delivery
           </div>
           <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#8B5E3C]">
              <Star size={16} /> Freshly Made
           </div>
        </div>

      </div>
    </div>
  );
}


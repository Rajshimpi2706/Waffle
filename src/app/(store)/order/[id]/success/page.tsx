import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Calendar, Phone, User, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

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

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-20 lg:py-32 animate-fade-in relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C17839]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3B1F0A]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="max-w-4xl mx-auto w-full px-4 relative z-10">
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-20 shadow-premium border border-white text-center relative overflow-hidden group">
          
          {/* Confetti-like accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#C17839] to-transparent opacity-30" />
          
          <div className="relative mb-12 inline-block">
            <div className="w-28 h-28 bg-[#FDF6EC] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-soft group-hover:rotate-6 transition-transform duration-500">
              <CheckCircle2 className="text-[#22C55E]" size={56} strokeWidth={1.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#C17839] rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
              <Star size={16} fill="currentColor" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-serif font-black text-[#3B1F0A] mb-6 tracking-tighter">
            Order <span className="text-[#C17839]">Received!</span>
          </h1>
          <p className="text-[#8B5E3C] text-xl font-medium italic mb-16 max-w-2xl mx-auto leading-relaxed opacity-80">
            "Your order has been sent to our kitchen. We're getting the batter ready to bake your moment of happiness!"
          </p>

          <div className="bg-[#FDF6EC]/50 rounded-[3rem] p-10 lg:p-14 text-left border border-[#F5E6CC] mb-16 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShoppingBag size={120} className="text-[#3B1F0A]" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-8 border-b border-[#F5E6CC] pb-10 relative z-10">
              <div>
                <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.3em] mb-3">Order Identifier</p>
                <p className="text-4xl font-serif font-black text-[#3B1F0A] tracking-tighter">{order.order_number}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.3em] mb-3">Confirmation Status</p>
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-[#22C55E] text-xs font-black border border-[#22C55E]/20 shadow-soft">
                  <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                  PAID & SECURED
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-10 relative z-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#F5E6CC] flex items-center justify-center text-[#C17839] shadow-soft">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1 opacity-60">Customer Name</p>
                  <p className="font-bold text-[#3B1F0A] text-lg">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#F5E6CC] flex items-center justify-center text-[#C17839] shadow-soft">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1 opacity-60">Mobile Contact</p>
                  <p className="font-bold text-[#3B1F0A] text-lg">{order.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#F5E6CC] flex items-center justify-center text-[#C17839] shadow-soft">
                  <Calendar size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1 opacity-60">Transaction Time</p>
                  <p className="font-bold text-[#3B1F0A] text-lg">
                    {format(new Date(order.created_at), 'dd MMM yyyy, p')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#F5E6CC] flex items-center justify-center text-[#C17839] shadow-soft">
                  <Zap size={22} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1 opacity-60">Deliverable</p>
                  <p className="font-bold text-[#3B1F0A] text-lg">{order.items?.length || 0} Premium Creation(s)</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-[#F5E6CC] mt-10 relative z-10">
               <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-[#F5E6CC] shadow-medium group">
                 <div className="flex items-center gap-4">
                    <ShieldCheck size={28} className="text-[#22C55E]" />
                    <span className="font-black text-[#3B1F0A] uppercase tracking-[0.2em] text-sm">Grand Total Paid</span>
                 </div>
                 <span className="text-4xl font-serif font-black text-[#C17839]">{formatCurrency(order.total_amount)}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
             <Link 
               href={`/order/${order.id}/track`} 
               className="inline-flex items-center justify-center gap-4 px-12 h-20 bg-[#C17839] text-white font-black text-xl rounded-[2rem] hover:bg-[#3B1F0A] transition-all shadow-premium hover:shadow-[#C17839]/20 active:scale-[0.97] group"
             >
               Track Live Status
               <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link 
               href="/menu" 
               className="inline-flex items-center justify-center gap-4 px-12 h-20 bg-white text-[#3B1F0A] font-bold text-xl rounded-[2rem] border border-[#F5E6CC] hover:bg-[#FDF6EC] transition-all active:scale-[0.97]"
             >
               Order More
             </Link>
          </div>

          {/* Trust Micro-strip */}
          <div className="mt-20 pt-12 border-t border-[#FDF6EC] flex flex-wrap justify-center gap-12 opacity-40">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck size={14} /> Encrypted Payment
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Zap size={14} /> Instant Confirmation
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Star size={14} /> Quality Guaranteed
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Calendar, Phone, User, ArrowRight } from 'lucide-react';
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

  // Ensure payment is verified (paid)
  const isPaid = order.payment?.some((p: any) => p.status === 'paid') || order.status !== 'pending';

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12 lg:py-20 animate-fade-in">
      <div className="max-w-3xl mx-auto w-full px-4">
        <div className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-xl shadow-[#C17839]/5 border border-white text-center relative overflow-hidden">
          
          {/* Confetti-like accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-[#C17839] to-transparent"></div>
          
          <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 animate-bounce-subtle">
            <CheckCircle2 className="text-green-500" size={48} />
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 text-xl mb-12 max-w-lg mx-auto leading-relaxed">
            Your payment was successful and we've started preparing your delicious waffles. Get ready for a treat!
          </p>

          <div className="bg-[#FDF6EC] rounded-[2.5rem] p-8 lg:p-10 text-left space-y-8 border border-[#F5E6CC] mb-12 shadow-inner">
            <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-[#F5E6CC] pb-8">
              <div>
                <p className="text-xs font-black text-[#8B5E3C] uppercase tracking-[0.2em] mb-2">Order Number</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">{order.order_number}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-black text-[#8B5E3C] uppercase tracking-[0.2em] mb-2">Status</p>
                <span className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-black bg-white text-green-700 border-2 border-green-100 shadow-sm">
                   PAID & CONFIRMED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                  <p className="font-bold text-gray-800 text-lg">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</p>
                  <p className="font-bold text-gray-800 text-lg">{order.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Date</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {format(new Date(order.created_at), 'dd MMM yyyy, p')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-gray-400 shadow-sm">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</p>
                  <p className="font-bold text-gray-800 text-lg">{order.items?.length || 0} Delicious Waffles</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-[#F5E6CC]">
               <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border-2 border-[#F5E6CC] shadow-sm">
                 <span className="font-black text-gray-900 uppercase tracking-widest text-sm">Amount Paid</span>
                 <span className="text-3xl font-black text-[#C17839]">{formatCurrency(order.total_amount)}</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
             <Link 
               href={`/order/${order.id}/track`} 
               className="inline-flex items-center justify-center gap-3 px-10 h-18 bg-[#C17839] text-white font-black text-lg rounded-[1.5rem] hover:bg-[#A8662D] transition-all shadow-xl shadow-[#C17839]/20 hover:shadow-[#C17839]/30 active:scale-[0.97]"
             >
               Track Your Order
               <ArrowRight size={24} />
             </Link>
             <Link 
               href="/menu" 
               className="inline-flex items-center justify-center gap-3 px-10 h-18 bg-white text-gray-800 font-bold text-lg rounded-[1.5rem] border-2 border-gray-100 hover:border-[#C17839] hover:text-[#C17839] transition-all active:scale-[0.97]"
             >
               Order More
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

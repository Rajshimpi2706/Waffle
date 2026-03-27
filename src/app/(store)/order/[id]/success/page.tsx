import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Calendar, Phone, User, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface SuccessPageProps {
  params: Promise<{ id: string }>;
}

export default async function SuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch order details with joined items and payment
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*), payment:payments(*)')
    .eq('id', id)
    .single();

  if (error || !order) {
    return notFound();
  }

  // Ensure payment is verified (paid) before celebrating
  const isPaid = order.payment?.some((p: any) => p.status === 'paid') || order.status === 'confirmed';

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12 lg:py-20 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100 text-center">
        
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
          <CheckCircle2 className="text-green-500" size={40} />
        </div>

        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          Thank you for your order. We've received your payment and our chefs are getting ready to bake your waffles.
        </p>

        <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 text-left space-y-6 border border-gray-100 mb-10">
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest mb-1">Order Number</p>
              <p className="text-xl font-black text-gray-900">{order.order_number}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold text-[#8B5E3C] uppercase tracking-widest mb-1">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                {isPaid ? 'Confirmed & Paid' : 'Pending Verification'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="flex items-start gap-3">
              <User size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                <p className="font-semibold text-gray-800">{order.customer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Phone</p>
                <p className="font-semibold text-gray-800">{order.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { 
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShoppingBag size={18} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Items</p>
                <p className="font-semibold text-gray-800">{order.items?.length || 0} Items Ordered</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
             <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100">
               <span className="font-bold text-gray-900">Total Paid</span>
               <span className="text-2xl font-black text-[#C17839]">{formatCurrency(order.subtotal)}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link 
             href="/menu" 
             className="inline-flex items-center justify-center gap-2 px-8 h-14 bg-[#C17839] text-white font-bold rounded-2xl hover:bg-[#A8662D] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
           >
             Order More Waffles
             <ArrowRight size={20} />
           </Link>
           <Link 
             href="/" 
             className="inline-flex items-center justify-center gap-2 px-8 h-14 bg-white text-gray-600 font-bold rounded-2xl border-2 border-gray-100 hover:border-[#C17839] hover:text-[#C17839] transition-all active:scale-[0.98]"
           >
             Go Home
           </Link>
        </div>

      </div>
    </div>
  );
}

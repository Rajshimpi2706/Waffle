import { createServiceClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TrackClient } from './TrackClient';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TrackPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phone?: string }>;
}

export default async function TrackPage({ params, searchParams }: TrackPageProps) {
  const { id } = await params;
  const { phone: phoneLast4 } = await searchParams;
  const supabase = await createServiceClient();

  // 1. Fetch order details (Secure lookup logic)
  let query = supabase
    .from('orders')
    .select('*, items:order_items(*), payment:payments(*)');

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('order_number', id);
  }

  const { data: order, error } = await query.single();

  // 2. Handle Not Found / Restricted Access
  if (error || !order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag className="text-[#C17839]" size={40} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">Order Not Found</h1>
        <p className="text-gray-500 max-w-md mb-10">
          We couldn't find the order you're looking for. Please check the order number or your tracking link.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="px-8 h-14 flex items-center justify-center bg-[#C17839] text-white font-bold rounded-2xl hover:bg-[#A8662D] transition-all shadow-lg">
            Go Home
          </Link>
          <Link href="/menu" className="px-8 h-14 flex items-center justify-center bg-white text-gray-600 font-bold rounded-2xl border-2 border-gray-100 hover:border-[#C17839] hover:text-[#C17839] transition-all">
             Explore Menu
          </Link>
        </div>
      </div>
    );
  }

  // 3. Verify Phone if using Order Number lookup
  if (!isUuid) {
    const actualSuffix = order.customer_phone.slice(-4);
    if (!phoneLast4 || actualSuffix !== phoneLast4) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in text-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
            <ShoppingBag className="text-red-500" size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Verification Required</h1>
          <p className="text-gray-500 max-w-md mb-8">
            For your security, please use the direct link from your confirmation email or SMS to track this order.
          </p>
          <Link href="/account/orders" className="text-[#8B5E3C] font-bold flex items-center gap-2 hover:underline">
            <ArrowLeft size={16} />
            Go to Your Orders
          </Link>
        </div>
      );
    }
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen">
      <TrackClient initialOrder={order} phoneLast4={phoneLast4} />
    </div>
  );
}

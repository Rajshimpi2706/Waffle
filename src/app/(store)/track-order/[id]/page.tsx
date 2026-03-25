import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TrackingClient } from './TrackingClient';

export const metadata = {
  title: 'Track Order | Waffle House',
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ id: string }>; // In this case 'id' in the URL is actually 'order_number' (e.g. WAFFLE-20231015-001)
}) {
  const { id: order_number } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      order_status,
      payment_status,
      created_at,
      confirmed_at,
      preparing_at,
      ready_at,
      out_for_delivery_at,
      delivered_at,
      cancelled_at,
      refunded_at
    `)
    .eq('order_number', order_number)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-2xl text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-3">
          Track Your Order
        </h1>
        <p className="text-[#8B5E3C] font-mono tracking-widest bg-white inline-block px-4 py-1 rounded-full border border-[#F5E6CC]">
          {order.order_number}
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-2xl">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading tracker...</div>}>
          <TrackingClient initialOrder={order} />
        </Suspense>
      </div>
    </div>
  );
}

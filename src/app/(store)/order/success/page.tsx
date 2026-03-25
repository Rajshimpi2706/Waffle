import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const metadata = {
  title: 'Order Successful | Waffle House',
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_number?: string }>;
}) {
  const { order_number } = await searchParams;

  if (!order_number) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-[#8B5E3C] mb-4">No order specified.</p>
        <Link href="/menu">
          <Button variant="primary">Return to Menu</Button>
        </Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        quantity,
        total_price,
        product:products(name),
        order_item_toppings(
          unit_price,
          quantity,
          topping:toppings_addons(name)
        )
      ),
      shipping_address:addresses(*)
    `)
    .eq('order_number', order_number)
    .single();

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-[#8B5E3C] mb-4">Order not found.</p>
        <Link href="/menu">
          <Button variant="primary">Return to Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl animate-fade-in" style={{ animationDelay: '100ms' }}>
        
        {/* Header content */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-3">
            Order Confirmed!
          </h1>
          <p className="text-[#8B5E3C] text-lg">
            Thank you for ordering from Waffle House. Your order is being prepared.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#F5E6CC] overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-[#3B1F0A] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Order Number</p>
              <p className="font-mono text-xl font-bold tracking-widest text-[#E8A535]">
                {order.order_number}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-white/70 text-sm mb-1">Date</p>
              <p className="font-medium">
                {format(new Date(order.created_at), 'PPP')}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Quick Status */}
            <div className="flex bg-[#FDF6EC] rounded-2xl p-4 gap-4 items-start border border-[#F0E0C8]">
               <div className="bg-white p-2 rounded-full text-[#C17839] shadow-sm"><Clock size={24} /></div>
               <div>
                 <h3 className="font-semibold text-[#3B1F0A]">Estimated Delivery</h3>
                 <p className="text-[#8B5E3C] text-sm mt-1">Usually within 45 minutes.</p>
                 <Link href={`/track-order/${order.order_number}`} className="inline-block mt-3 text-sm font-semibold text-[#C17839] hover:underline">
                   Track your order Live →
                 </Link>
               </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-serif font-semibold text-lg text-[#3B1F0A] mb-4 border-b border-[#F5E6CC] pb-2">Order Summary</h3>
              <div className="space-y-4">
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-[#3B1F0A]">{item.quantity}x {item.product?.name}</p>
                      {item.order_item_toppings?.length > 0 && (
                        <p className="text-sm text-[#8B5E3C] mt-1 pr-4">
                          + {item.order_item_toppings.map((t: any) => t.topping?.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <p className="font-medium text-[#3B1F0A] whitespace-nowrap">
                       {/* Calculate full text item cost based on base + toppings */}
                       {formatCurrency(
                          (item.total_price / item.quantity) * item.quantity + 
                          (item.order_item_toppings?.reduce((acc: number, t: any) => acc + (t.unit_price * t.quantity), 0) || 0) * item.quantity
                       )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-[#F5E6CC] pt-4 space-y-2 text-sm text-[#8B5E3C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.delivery_fee > 0 ? formatCurrency(order.delivery_fee) : 'Free'}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-[#3B1F0A] pt-4 mt-2 border-t border-[#F5E6CC]">
                <span>Total Paid</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>

            {/* Delivery address */}
            {order.shipping_address && (
              <div className="bg-[#F9F9F9] rounded-2xl p-6 border border-[#E5E5E5] flex gap-4">
                <MapPin className="text-[#8B5E3C] flex-shrink-0 mt-1" size={20} />
                <div className="text-sm">
                  <p className="font-semibold text-[#3B1F0A] mb-1">Delivering to: {order.shipping_address.full_name}</p>
                  <p className="text-[#8B5E3C] leading-relaxed">
                    {order.shipping_address.address_line1},<br/>
                    {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                  </p>
                  <p className="text-[#8B5E3C] mt-2">Ph: {order.shipping_address.phone}</p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/track-order/${order.order_number}`}>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Track Order Live
            </Button>
          </Link>
          <Link href="/menu">
             <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}

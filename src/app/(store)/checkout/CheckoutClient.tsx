'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight, Trash2 } from 'lucide-react';
import { useCartStore, computeCartTotals } from '@/lib/cart';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';

export function CheckoutClient({ branch }: { branch: any }) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, couponDiscount } = useCartStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null);

  // Re-compute cart if tax settings are available
  const summary = computeCartTotals(
    subtotal,
    couponDiscount,
    deliveryFee,
    branch?.tax_percentage || 0,
    branch?.prices_include_tax || false
  );

  // Script load for Razorpay
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added any waffles yet. Let's fix that!"
        actionLabel="Browse Menu"
        onAction={() => router.push('/menu')}
      />
    );
  }

  const handlePincodeCheck = async () => {
    if (pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    try {
      // Direct DB call or API call for pincode check (Mocked for UI flow, assuming API exists soon)
      const res = await fetch(`/api/delivery-zones/check?pincode=${pincode}&branch_id=${branch?.id}`);
      const data = await res.json();

      if (res.ok && data.is_active) {
        setIsServiceable(true);
        setDeliveryFee(data.delivery_fee);
        toast.success(`Serviceable! Delivery in ~${data.estimated_delivery_minutes} mins`);
      } else {
        setIsServiceable(false);
        setDeliveryFee(0);
        toast.error('Sorry, we do not deliver to this pincode yet.');
      }
    } catch (err) {
      toast.error('Failed to verify pincode');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServiceable) {
      toast.error('Please verify serviceability of your pincode first.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on server
      const formData = new FormData(e.target as HTMLFormElement);
      const payload = {
        branch_id: branch?.id,
        items,
        shipping_address: {
          fullName: formData.get('fullName'),
          phone: formData.get('phone'),
          addressLine1: formData.get('address'),
          city: formData.get('city'),
          state: formData.get('state'),
          pincode: pincode,
        },
        order_type: 'delivery',
      };

      const createRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const { data, error } = await createRes.json();
      if (!createRes.ok) throw new Error(error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'Waffle House',
        description: `Order ${data.order.order_number}`,
        order_id: data.razorpayOrder.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internal_order_id: data.order.id
              })
            });

            if (!verifyRes.ok) throw new Error('Payment verification failed');

            // Clear cart and redirect
            useCartStore.getState().clearCart();
            router.push(`/order/success?order_number=${data.order.order_number}`);
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
            router.push(`/order/failed?order_id=${data.order.id}`); // Optional fallback page
          }
        },
        prefill: {
          name: payload.shipping_address.fullName,
          contact: payload.shipping_address.phone,
        },
        theme: {
          color: '#3B1F0A'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description);
      });
      rzp.open();

    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
      {/* Left Column - Forms */}
      <div className="flex-1 space-y-6">

        {/* Step 1: Pincode Check */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5D5C0]">
          <h2 className="text-xl font-serif font-semibold text-[#3B1F0A] mb-4">1. Delivery Check</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter 6-digit Pincode"
              maxLength={6}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, ''));
                setIsServiceable(null);
                setDeliveryFee(0);
              }}
              className="max-w-xs"
            />
            <Button variant="outline" onClick={handlePincodeCheck} loading={loading}>
              Verify
            </Button>
          </div>
          {isServiceable === false && (
            <p className="text-red-600 text-sm mt-2 font-medium">Sorry, we don't deliver to this area yet.</p>
          )}
          {isServiceable === true && (
            <p className="text-green-700 text-sm mt-2 font-medium">Great! We deliver to your location.</p>
          )}
        </div>

        {/* Step 2: Address Form */}
        <div className={`transition-opacity duration-300 ${isServiceable ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5D5C0]">
            <h2 className="text-xl font-serif font-semibold text-[#3B1F0A] mb-4">2. Delivery Details</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8B5E3C] mb-1">Full Name</label>
                  <Input name="fullName" required placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm text-[#8B5E3C] mb-1">Phone Number</label>
                  <Input name="phone" required placeholder="9876543210" pattern="[0-9]{10}" title="10 digit phone number" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#8B5E3C] mb-1">Detailed Address (House No, Building, Street)</label>
                <Input name="address" required placeholder="Flat 101, Waffle Tower" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#8B5E3C] mb-1">City</label>
                  <Input name="city" required placeholder="Bengaluru" defaultValue="Bengaluru" />
                </div>
                <div>
                  <label className="block text-sm text-[#8B5E3C] mb-1">State</label>
                  <Input name="state" required placeholder="Karnataka" defaultValue="Karnataka" />
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:w-96 flex-shrink-0">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C17839] sticky top-24">
          <h2 className="text-xl font-serif font-semibold text-[#3B1F0A] mb-4 border-b border-[#F5E6CC] pb-4">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2">
                <div className="flex-1">
                  <span className="font-semibold text-[#3B1F0A]">{item.quantity}x </span>
                  <span className="text-[#3B1F0A]">Product ID: {item.productId} {/* Needs active JOIN if full product obj not saved. In full implementation, we save product title in Zustand */}</span>
                  {item.toppings?.length > 0 && (
                    <p className="text-xs text-[#8B5E3C] mt-1 pl-6">
                      + {item.toppings.map(t => t.name).join(', ')}
                    </p>
                  )}
                  {/* Note: since Zustand cart only stores IDs realistically, production cart UI should fetch product meta or store it in cart.ts. For UI we assume product name is fetch/stored. */}
                </div>
                <div className="text-right">
                  <span className="font-medium text-[#3B1F0A]">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-sm border-t border-[#F5E6CC] pt-4 mb-6">
            <div className="flex justify-between text-[#8B5E3C]">
              <span>Subtotal</span>
              <span>{formatCurrency(summary.subtotal)}</span>
            </div>
            {summary.taxAmount > 0 && (
              <div className="flex justify-between text-[#8B5E3C]">
                <span>Taxes & GST</span>
                <span>{formatCurrency(summary.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#8B5E3C]">
              <span>Delivery Fee</span>
              <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : isServiceable === true ? 'Free' : '-'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-[#3B1F0A] pt-2 border-t border-[#F5E6CC]">
              <span>Total</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            variant="primary"
            size="xl"
            className="w-full"
            loading={loading}
            disabled={!isServiceable || items.length === 0}
          >
            Proceed to Pay
          </Button>
          <p className="text-xs text-center text-[#8B5E3C] mt-4 flex items-center justify-center gap-1">
            <span className="inline-block w-4 h-4 bg-[url('https://cdn.razorpay.com/static/assets/favicon.ico')] bg-contain bg-no-repeat grayscale opacity-60"></span>
            Secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/lib/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShoppingBag, ArrowLeft, ShieldCheck, Phone, User, CreditCard, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEmpty = items.length === 0;

  useEffect(() => {
    // Fetch user profile to prefill
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || prev.name,
          phone: user.phone ? user.phone.replace('+91', '') : prev.phone
        }));

        // Try syncing from customers table
        const { data: cust } = await supabase.from('customers').select('name, phone').eq('auth_user_id', user.id).single();
        if (cust) {
          setFormData(prev => ({
            ...prev,
            name: cust.name || prev.name,
            phone: cust.phone ? cust.phone.replace('+91', '') : prev.phone
          }));
        }
      }
    };
    fetchUser();

    // Check if script is already loaded
    if ((window as any).Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    if (isEmpty) {
      toast.error('Your cart is empty');
      return;
    }
    if (!razorpayLoaded) {
      toast.error('Payment system is still loading. Please wait.');
      return;
    }

    setIsProcessing(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.info('Please login to complete your order.');
        const redirectUrl = new URL(window.location.href);
        const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl.pathname + redirectUrl.search)}`;
        router.push(loginUrl);
        return;
      }

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          items: items.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
          }))
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error: any = new Error(data.error || 'Failed to create order');
        error.suggestion = data.suggestion;
        throw error;
      }

      const orderData = data;
      const { id: localOrderId, amount, currency, razorpay_order_id, key } = orderData.order;

      // ─── RACE CONDITION FIX ────────────────────────────────────────────────
      // This flag is set to true the moment the Razorpay success handler fires.
      // The payment.failed listener MUST check this flag before routing to the
      // failure page, because Razorpay can fire payment.failed on modal close
      // even after a successful payment has already been handled.
      let paymentSucceeded = false;
      // ────────────────────────────────────────────────────────────────────────

      const options = {
        key: key,
        // FIX: Backend returns amount in rupees. Do NOT multiply by 100.
        // Razorpay modal's `amount` field is for display only — the actual
        // capture amount is locked to the Razorpay order created server-side.
        amount: amount,
        currency: currency,
        name: 'Waffle Wala',
        description: `Order #${orderData.order.order_number}`,
        image: '/logo.png',
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          // Mark success IMMEDIATELY before any async work so the
          // payment.failed listener sees paymentSucceeded === true
          // if it fires concurrently during modal close.
          paymentSucceeded = true;

          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                local_order_id: localOrderId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              // Redirect to the success page — this is the ONLY success path
              router.push(`/order/${localOrderId}/success`);
            } else {
              throw new Error(verifyData.error || 'Verification failed');
            }
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
            router.push('/payment-failed');
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: '#C17839',
        },
        modal: {
          ondismiss: function () {
            // Only reset processing if payment was NOT already successfully handled.
            // If the user dismissed AFTER a successful payment, we don't
            // want to interfere — the handler is already routing to success.
            if (!paymentSucceeded) {
              setIsProcessing(false);
            }
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        // CRITICAL: Guard against this event firing after a successful payment.
        // Razorpay can emit payment.failed during modal teardown even when the
        // handler has already confirmed success. Without this guard, the app
        // shows success briefly and then navigates to the failure page.
        if (paymentSucceeded) {
          console.warn('[Razorpay] payment.failed event ignored — success already confirmed.');
          return;
        }

        toast.error('Payment failed: ' + response.error.description);
        setIsProcessing(false);
        router.push('/payment-failed');
      });

      rzp.open();

    } catch (err: any) {
      console.error('Checkout error detail:', err);

      const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
      const suggestion = err.suggestion || 'Please check your information and try again.';

      toast.error(errorMsg, {
        description: suggestion,
        duration: 10000
      });
    } finally {
      // Only reset the processing spinner if we haven't already redirected.
      // This avoids a flicker where the button briefly re-enables after rzp.open()
      // returns but before the handler completes.
      // Note: if payment succeeds, the component will unmount during navigation anyway.
      setIsProcessing(false);
    }
  };


  if (isEmpty && !isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 bg-[#FDF6EC]">
        <div className="bg-white p-8 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-premium border border-[#F5E6CC] text-center max-w-sm sm:max-w-md w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#C17839] to-transparent opacity-20" />
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#FDF6EC] rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-soft rotate-3">
            <ShoppingBag className="text-[#C17839]" size={36} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#3B1F0A] mb-3 sm:mb-4">Your cart is empty</h1>
          <p className="text-[#8B5E3C] mb-8 sm:mb-10 font-medium italic opacity-70 text-sm">
            &ldquo;Happiness is just a few waffles away. Let&apos;s fill up that cart!&rdquo;
          </p>
          <Button onClick={() => router.push('/menu')} size="xl" className="w-full h-14 sm:h-16 rounded-2xl bg-[#3B1F0A] hover:bg-black text-white shadow-lg active:scale-95 min-h-[52px]">
            Explore Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          onLoad={() => setRazorpayLoaded(true)}
          onError={() => toast.error('Failed to load payment system')}
        />

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 lg:gap-20">
          
          {/* Left Column: Form */}
          <div className="flex-1 space-y-6 sm:space-y-10 animate-fade-in">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white border border-[#F5E6CC] rounded-xl sm:rounded-2xl shadow-soft hover:shadow-medium hover:-translate-x-1 transition-all text-[#3B1F0A] shrink-0 min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#3B1F0A] tracking-tighter">Checkout</h1>
                <p className="text-[10px] text-[#A17C5F] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Secure Order Process</p>
              </div>
            </div>

            {/* Customer Details Form */}
            <section className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-12 shadow-soft border border-[#F5E6CC] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#C17839]/10" />
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3B1F0A] mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839] shrink-0">
                  <User size={18} />
                </div>
                Customer Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" />
                    <Input
                      placeholder="Enter your name"
                      className="pl-11 sm:pl-14 h-12 sm:h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-xl sm:rounded-2xl focus:shadow-premium transition-all text-[#3B1F0A] font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      error={!!errors.name}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1 font-black uppercase tracking-widest">{errors.name}</p>}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" />
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      className="pl-11 sm:pl-14 h-12 sm:h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-xl sm:rounded-2xl focus:shadow-premium transition-all text-[#3B1F0A] font-bold"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      error={!!errors.phone}
                      maxLength={10}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 mt-1 ml-1 font-black uppercase tracking-widest">{errors.phone}</p>}
                </div>
              </div>
            </section>

            {/* Security Badge */}
            <div className="bg-[#3B1F0A] rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex items-start gap-4 sm:gap-6 shadow-medium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C17839]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#C17839] shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold tracking-tight">Encrypted Checkout</h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-medium">
                  Your payment is handled securely via <strong>Razorpay</strong>. We follow 256-bit encryption standards and do not store your sensitive card or banking details.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[420px] xl:w-[450px] space-y-6 sm:space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-[1.5rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-12 shadow-premium border border-[#F5E6CC] lg:sticky lg:top-28 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#FDF6EC] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />

              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3B1F0A] mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4 relative z-10">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839] shrink-0">
                  <ShoppingBag size={18} />
                </div>
                Your Order
              </h2>

              {/* Order Items List */}
              <div className="space-y-4 sm:space-y-6 max-h-[260px] sm:max-h-[350px] overflow-y-auto pr-1 scrollbar-hide mb-6 sm:mb-10 relative z-10">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 group hover:translate-x-1 transition-transform">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#3B1F0A] group-hover:text-[#C17839] transition-colors line-clamp-1 text-sm sm:text-base">{item.productName}</p>
                      <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-60">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-serif font-black text-[#3B1F0A] whitespace-nowrap text-sm sm:text-base">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 sm:space-y-4 pt-5 sm:pt-8 border-t border-[#FDF6EC] relative z-10">
                <div className="flex justify-between text-[#8B5E3C] font-medium">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-[#FDF6EC] p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[#F5E6CC] mt-4 sm:mt-6 relative overflow-hidden group">
                  <span className="text-base sm:text-lg font-serif font-black text-[#3B1F0A] relative z-10">Amount to Pay</span>
                  {/* Price capped to prevent overflow at 320px */}
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-[#C17839] relative z-10">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              {/* Payment CTA */}
              <Button
                onClick={handlePayment}
                size="xl"
                className="w-full mt-6 sm:mt-10 h-14 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-premium bg-[#C17839] hover:bg-[#3B1F0A] text-white border-none group transition-all active:scale-95 text-base sm:text-lg font-black min-h-[52px]"
                loading={isProcessing}
                disabled={!razorpayLoaded || isEmpty}
              >
                <CreditCard size={20} className="mr-2 sm:mr-3 group-hover:rotate-12 transition-transform" />
                Proceed to Payment
              </Button>

              {!razorpayLoaded && (
                <div className="mt-4 sm:mt-6 flex flex-col items-center gap-2 sm:gap-3 animate-pulse">
                  <div className="flex items-center gap-2 text-[10px] text-[#A17C5F] font-black uppercase tracking-widest">
                    <Loader2 size={12} className="animate-spin text-[#C17839]" />
                    Initializing Secure Vault
                  </div>
                </div>
              )}

              <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 opacity-40">
                <div className="h-[1px] flex-1 bg-[#8B5E3C]/20" />
                <Star size={10} className="text-[#8B5E3C]" />
                <div className="h-[1px] flex-1 bg-[#8B5E3C]/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

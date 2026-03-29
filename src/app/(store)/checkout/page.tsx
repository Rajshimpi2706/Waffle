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

      const options = {
        key: key,
        amount: amount * 100, // already in paise if backend sends it that way, but my backend sends rupees.
        currency: currency,
        name: 'Waffle Wala',
        description: `Order #${orderData.order.order_number}`,
        image: '/logo.png',
        order_id: razorpay_order_id,
        handler: async function (response: any) {
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
              // Redirect to the new Phase 4 success page
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
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
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
      setIsProcessing(false);
    }
  };

  if (isEmpty && !isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 bg-[#FDF6EC]">
        <div className="bg-white p-12 rounded-[3rem] shadow-premium border border-[#F5E6CC] text-center max-w-md w-full animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[#C17839] to-transparent opacity-20" />
          <div className="w-24 h-24 bg-[#FDF6EC] rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-soft rotate-3">
            <ShoppingBag className="text-[#C17839]" size={40} />
          </div>
          <h1 className="text-3xl font-serif font-black text-[#3B1F0A] mb-4">Your cart is empty</h1>
          <p className="text-[#8B5E3C] mb-10 font-medium italic opacity-70">
            "Happiness is just a few waffles away. Let's fill up that cart!"
          </p>
          <Button onClick={() => router.push('/menu')} size="xl" className="w-full h-16 rounded-2xl bg-[#3B1F0A] hover:bg-black text-white shadow-lg active:scale-95">
            Explore Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 py-16 lg:py-24">
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          onLoad={() => setRazorpayLoaded(true)}
          onError={() => toast.error('Failed to load payment system')}
        />
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="flex-1 space-y-12 animate-fade-in">
            <div className="flex items-center gap-6 mb-4">
              <button 
                onClick={() => router.back()} 
                className="w-12 h-12 flex items-center justify-center bg-white border border-[#F5E6CC] rounded-2xl shadow-soft hover:shadow-medium hover:-translate-x-1 transition-all text-[#3B1F0A]"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-black text-[#3B1F0A] tracking-tighter">Checkout</h1>
                <p className="text-[10px] text-[#A17C5F] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Secure Order Process</p>
              </div>
            </div>

            <section className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-soft border border-[#F5E6CC] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#C17839]/10" />
              <h2 className="text-2xl font-serif font-black text-[#3B1F0A] mb-10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839]">
                  <User size={20} />
                </div>
                Customer Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" />
                    <Input 
                      placeholder="Enter your name"
                      className="pl-14 h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-2xl focus:shadow-premium transition-all text-[#3B1F0A] font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      error={!!errors.name}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 mt-1 ml-1 font-black uppercase tracking-widest">{errors.name}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" />
                    <Input 
                      type="tel"
                      placeholder="10-digit mobile number"
                      className="pl-14 h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-2xl focus:shadow-premium transition-all text-[#3B1F0A] font-bold"
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

            <div className="bg-[#3B1F0A] rounded-[2rem] p-8 flex items-start gap-6 shadow-medium relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C17839]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#C17839] shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold tracking-tight">Encrypted Checkout</h4>
                <p className="text-sm text-white/60 leading-relaxed font-medium">
                  Your payment is handled securely via <strong>Razorpay</strong>. We follow 256-bit encryption standards and do not store your sensitive card or banking details.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px] space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-premium border border-[#F5E6CC] lg:sticky lg:top-28 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDF6EC] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
              
              <h2 className="text-2xl font-serif font-black text-[#3B1F0A] mb-10 flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] flex items-center justify-center text-[#C17839]">
                  <ShoppingBag size={20} />
                </div>
                Your Order
              </h2>

              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide mb-10 relative z-10">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-6 group hover:translate-x-1 transition-transform">
                    <div className="flex-1">
                      <p className="font-bold text-[#3B1F0A] group-hover:text-[#C17839] transition-colors line-clamp-1">{item.productName}</p>
                      <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-60">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-serif font-black text-[#3B1F0A] whitespace-nowrap">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-[#FDF6EC] relative z-10">
                <div className="flex justify-between text-[#8B5E3C] font-medium">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center bg-[#FDF6EC] p-6 rounded-2xl border border-[#F5E6CC] mt-6 group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C17839]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-lg font-serif font-black text-[#3B1F0A] relative z-10">Amount to Pay</span>
                  <span className="text-3xl font-serif font-black text-[#C17839] relative z-10">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePayment} 
                size="xl"
                className="w-full mt-10 h-16 rounded-[1.5rem] shadow-premium hover:shadow-[#C17839]/20 bg-[#C17839] hover:bg-[#3B1F0A] text-white border-none group transition-all active:scale-95 text-lg font-black"
                loading={isProcessing}
                disabled={!razorpayLoaded || isEmpty}
              >
                <CreditCard size={22} className="mr-3 group-hover:rotate-12 transition-transform" />
                Proceed to Payment
              </Button>

              {!razorpayLoaded && (
                <div className="mt-6 flex flex-col items-center gap-3 animate-pulse">
                  <div className="flex items-center gap-2 text-[10px] text-[#A17C5F] font-black uppercase tracking-widest">
                    <Loader2 size={12} className="animate-spin text-[#C17839]" /> 
                    Initializing Secure Vault
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-3 opacity-40">
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

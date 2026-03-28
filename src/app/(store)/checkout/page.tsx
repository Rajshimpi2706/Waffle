'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/lib/cart';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShoppingBag, ArrowLeft, ShieldCheck, Phone, User, CreditCard, Loader2 } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-[#FDF6EC] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-[#C17839]" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some delicious waffles to your cart before checking out.</p>
          <Button onClick={() => router.push('/menu')} variant="primary" className="w-full h-12 rounded-xl">
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8 lg:py-12">
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error('Failed to load payment system')}
      />
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 space-y-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900">Checkout</h1>
          </div>

          <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-[#C17839]" />
              Customer Information
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Enter your name"
                    className="pl-11 h-12 bg-gray-50/50 border-gray-200"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    error={!!errors.name}
                  />
                </div>
                {errors.name && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    type="tel"
                    placeholder="10-digit mobile number"
                    className="pl-11 h-12 bg-gray-50/50 border-gray-200"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    error={!!errors.phone}
                    maxLength={10}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{errors.phone}</p>}
              </div>
            </div>
          </section>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3 shadow-sm">
            <ShieldCheck className="text-[#C17839] shrink-0" size={20} />
            <p className="text-sm text-gray-600 leading-relaxed">
              Your payment is handled securely via <strong>Razorpay</strong>. We do not store your card details.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[400px] space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#C17839]" />
              Order Summary
            </h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {formatCurrency(Number(item.unitPrice) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span className="text-sm">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#E8A535] pt-3 border-t border-gray-100">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment} 
              className="w-full mt-8 h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              variant="primary"
              loading={isProcessing}
              disabled={!razorpayLoaded || isEmpty}
            >
              <CreditCard size={20} className="mr-2" />
              Pay Now
            </Button>

            {!razorpayLoaded && (
              <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Loader2 size={10} className="animate-spin" /> Fetching secure checkout...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

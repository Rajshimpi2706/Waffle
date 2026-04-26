'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { Button } from './Button';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCartStore();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener('open-cart', handleOpen);
    return () => document.removeEventListener('open-cart', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-sm sm:max-w-md bg-[#FDF6EC] shadow-premium flex flex-col animate-slide-in-right border-l border-[#F5E6CC]">

          {/* Header Architecture */}
          <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-6 border-b border-[#F5E6CC] bg-white shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#FDF6EC] flex items-center justify-center text-[#3B1F0A] shadow-soft">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-[#3B1F0A]">Your Cart</h2>
                <p className="text-[10px] text-[#A17C5F] font-black uppercase tracking-widest">{itemCount} items selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close cart"
              className="p-2.5 hover:bg-[#FDF6EC] rounded-full transition-all text-[#3B1F0A] hover:rotate-90 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X size={22} />
            </button>
          </div>

          {/* Cart Items Canvas */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in px-6 py-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mb-6 sm:mb-8 shadow-soft border border-[#F5E6CC] rotate-3">
                  <ShoppingBag size={36} className="text-[#F5E6CC]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-[#3B1F0A] mb-3 sm:mb-4">Cart is Empty</h3>
                <p className="text-sm text-[#8B5E3C] mb-8 font-medium leading-relaxed italic opacity-70">
                  &ldquo;Looks like you haven&apos;t added any happiness to your cart yet. Let&apos;s find your perfect waffle!&rdquo;
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="xl"
                  className="rounded-full bg-[#3B1F0A] hover:bg-black text-white px-10 shadow-lg active:scale-95 min-h-[52px]"
                >
                  Explore Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 group animate-fade-in bg-white p-3 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-[#F5E6CC] shadow-soft hover:shadow-medium transition-all duration-300">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-[#FDF6EC] rounded-xl sm:rounded-2xl overflow-hidden">
                      <Image
                        src={item.productImage || '/placeholder.png'}
                        alt={item.productName}
                        fill
                        sizes="96px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-serif font-bold text-[#3B1F0A] text-base sm:text-lg leading-tight group-hover:text-[#C17839] transition-colors line-clamp-1 mr-2">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.productName}`}
                          className="p-2 text-[#8B5E3C] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-[10px] text-[#A17C5F] font-black uppercase tracking-widest mb-3">
                        {formatCurrency(item.unitPrice)} / piece
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity Controls — upgraded to 44px tap targets */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-[#FDF6EC] rounded-xl p-1 border border-[#F5E6CC]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-white transition-all text-[#3B1F0A] shadow-sm disabled:opacity-30 active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-black text-[#3B1F0A] min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-white transition-all text-[#3B1F0A] shadow-sm active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-serif font-black text-[#3B1F0A] text-base sm:text-lg">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Architecture — iOS safe-area aware */}
          {items.length > 0 && (
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-safe bg-white border-t border-[#F5E6CC] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] space-y-4 shrink-0">
              <div className="space-y-3">
                <div className="flex justify-between text-[#8B5E3C] font-medium">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#A17C5F] text-[10px] font-black uppercase tracking-widest italic opacity-60">
                  <span>Taxes & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-xl sm:text-2xl font-serif font-black text-[#3B1F0A] pt-4 border-t border-[#FDF6EC]">
                  <span>Total</span>
                  <span className="text-[#C17839]">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/checkout');
                }}
                size="xl"
                className="w-full h-14 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-premium bg-[#C17839] hover:bg-[#3B1F0A] text-white border-none group transition-all active:scale-95 min-h-[52px]"
              >
                Checkout Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#A17C5F] uppercase tracking-[0.2em] font-black pb-1">
                <ShieldCheck size={13} className="text-[#22C55E]" />
                100% Secure Checkout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

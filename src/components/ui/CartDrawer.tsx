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
        <div className="relative w-screen max-w-md bg-[#FDF6EC] shadow-premium flex flex-col animate-slide-in-right border-l border-[#F5E6CC]">
          
          {/* Header Architecture */}
          <div className="flex items-center justify-between p-8 border-b border-[#F5E6CC] bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF6EC] flex items-center justify-center text-[#3B1F0A] shadow-soft">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-black text-[#3B1F0A]">Your Cart</h2>
                <p className="text-[10px] text-[#A17C5F] font-black uppercase tracking-widest">{itemCount} items selected</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-3 hover:bg-[#FDF6EC] rounded-full transition-all text-[#3B1F0A] hover:rotate-90"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items Canvas */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in px-8">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-soft border border-[#F5E6CC] rotate-3">
                  <ShoppingBag size={40} className="text-[#F5E6CC]" />
                </div>
                <h3 className="text-2xl font-serif font-black text-[#3B1F0A] mb-4">Cart is Empty</h3>
                <p className="text-sm text-[#8B5E3C] mb-10 font-medium leading-relaxed italic opacity-70">
                  "Looks like you haven't added any happiness to your cart yet. Let's find your perfect waffle!"
                </p>
                <Button 
                  onClick={() => setIsOpen(false)}
                  size="xl"
                  className="rounded-full bg-[#3B1F0A] hover:bg-black text-white px-10 shadow-lg active:scale-95"
                >
                  Explore Menu
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group animate-fade-in bg-white p-5 rounded-[2rem] border border-[#F5E6CC] shadow-soft hover:shadow-premium transition-all duration-500">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-[#FDF6EC] rounded-2xl overflow-hidden m-[-4px]">
                      <Image 
                        src={item.productImage || '/placeholder.png'} 
                        alt={item.productName}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-serif font-bold text-[#3B1F0A] text-lg leading-tight group-hover:text-[#C17839] transition-colors">
                          {item.productName}
                        </h4>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-[#8B5E3C] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-[#A17C5F] font-black uppercase tracking-widest mb-4">
                        {formatCurrency(item.unitPrice)} / piece
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-[#FDF6EC] rounded-xl p-1 border border-[#F5E6CC]">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-[#3B1F0A] shadow-sm disabled:opacity-30"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-black text-[#3B1F0A] min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-all text-[#3B1F0A] shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-serif font-black text-[#3B1F0A] text-lg">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Architecture */}
          {items.length > 0 && (
            <div className="p-8 bg-white border-t border-[#F5E6CC] shadow-[0_-20px_40px_rgba(0,0,0,0.02)] space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-[#8B5E3C] font-medium">
                  <span className="text-sm">Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#A17C5F] text-[10px] font-black uppercase tracking-widest italic opacity-60">
                  <span>Taxes & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-2xl font-serif font-black text-[#3B1F0A] pt-6 border-t border-[#FDF6EC]">
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
                className="w-full h-16 rounded-[1.5rem] shadow-premium hover:shadow-[#C17839]/20 bg-[#C17839] hover:bg-[#3B1F0A] text-white border-none group transition-all active:scale-95"
              >
                Checkout Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-[#A17C5F] uppercase tracking-[0.2em] font-black">
                <ShieldCheck size={14} className="text-[#22C55E]" />
                100% Secure Checkout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

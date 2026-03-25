'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { Button } from './Button';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export function CartDrawer() {
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
        <div className="relative w-screen max-w-md bg-[#FDF6EC] shadow-2xl flex flex-col animate-slide-in-right">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#F5E6CC] bg-white">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-[#3B1F0A]" size={24} />
              <div>
                <h2 className="text-xl font-serif font-bold text-[#3B1F0A]">Your Cart</h2>
                <p className="text-xs text-[#8B5E3C] font-medium">{itemCount} items selected</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-[#FDF6EC] rounded-full transition-colors text-[#3B1F0A]"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#F5E6CC]">
                  <ShoppingBag size={32} className="text-[#F5E6CC]" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#3B1F0A] mb-2">Cart is Empty</h3>
                <p className="text-sm text-[#8B5E3C] mb-8 max-w-[200px]">
                  Looks like you haven't added any happiness to your cart yet!
                </p>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-[#C17839] hover:bg-[#A8662D] text-white px-8"
                >
                  Start Ordering
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 group animate-fade-in bg-white p-4 rounded-2xl border border-[#F5E6CC] shadow-sm">
                  <div className="relative w-20 h-20 flex-shrink-0 bg-[#FDF6EC] rounded-xl overflow-hidden">
                    <Image 
                      src={item.productImage || '/placeholder.png'} 
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-serif font-bold text-[#3B1F0A] leading-tight">
                        {item.productName}
                      </h4>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-[#8B5E3C] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-[#8B5E3C] mb-3">₹{item.unitPrice} per piece</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-[#FDF6EC] rounded-lg p-1 border border-[#F5E6CC]">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors text-[#3B1F0A]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold text-[#3B1F0A] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white transition-colors text-[#3B1F0A]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-[#3B1F0A]">₹{item.unitPrice * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#F5E6CC] space-y-4">
                <div className="flex justify-between text-[#8B5E3C]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#8B5E3C] text-sm italic">
                  <span>Taxes & Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-xl font-serif font-bold text-[#3B1F0A] pt-4 border-t border-[#FDF6EC]">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              
              <Button 
                className="w-full rounded-full bg-[#3B1F0A] hover:bg-[#C17839] text-white py-6 text-lg font-bold shadow-lg flex items-center justify-center gap-2 group"
                onClick={() => alert('Checkout functionality is coming in Phase 2!')}
              >
                Proceed to Checkout
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-center text-[10px] text-[#8B5E3C] uppercase tracking-widest font-bold">
                100% Secure Checkout Guaranteed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

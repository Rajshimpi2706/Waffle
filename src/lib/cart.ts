'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, CartTopping } from '@/types';
import { generateId } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  mergeGuestCart: (serverItems: CartItem[]) => void;

  // Computed
  get subtotal(): number;
  get itemCount(): number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      couponDiscount: 0,

      get subtotal() {
        return get().items.reduce((sum, item) => {
          const toppingTotal = item.toppings.reduce((t, topping) => t + topping.price, 0);
          return sum + (item.unitPrice + toppingTotal) * item.quantity;
        }, 0);
      },

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      addItem: (item) => {
        set((state) => {
          // Check if same product+variant+toppings already in cart
          const existingIdx = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.variantId === item.variantId &&
              JSON.stringify(i.toppings.map((t) => t.id).sort()) ===
                JSON.stringify(item.toppings.map((t) => t.id).sort())
          );

          if (existingIdx >= 0) {
            const updated = [...state.items];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: updated[existingIdx].quantity + item.quantity,
            };
            return { items: updated };
          }

          return { items: [...state.items, { ...item, id: generateId() }] };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [], couponCode: undefined, couponDiscount: 0 }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: undefined, couponDiscount: 0 }),

      /**
       * Merge guest cart from localStorage into logged-in user's existing cart.
       * Guest items take precedence for new products; existing cart items keep their quantities.
       */
      mergeGuestCart: (guestItems) => {
        set((state) => {
          const merged = [...state.items];
          for (const guestItem of guestItems) {
            const exists = merged.some(
              (i) =>
                i.productId === guestItem.productId &&
                i.variantId === guestItem.variantId &&
                JSON.stringify(i.toppings.map((t) => t.id).sort()) ===
                  JSON.stringify(guestItem.toppings.map((t) => t.id).sort())
            );
            if (!exists) {
              merged.push({ ...guestItem, id: generateId() });
            }
          }
          return { items: merged };
        });
      },
    }),
    {
      name: 'waffle-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helpers for computing totals with tax & delivery
export function computeCartTotals(
  subtotal: number,
  couponDiscount: number,
  deliveryFee: number,
  taxPercentage: number,
  pricesIncludeTax: boolean
) {
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

  let taxAmount: number;
  let baseForTax: number;

  if (pricesIncludeTax) {
    // Tax is embedded in the price — extract it
    taxAmount = discountedSubtotal - discountedSubtotal / (1 + taxPercentage / 100);
    baseForTax = discountedSubtotal - taxAmount;
  } else {
    baseForTax = discountedSubtotal;
    taxAmount = discountedSubtotal * (taxPercentage / 100);
  }

  const total = discountedSubtotal + deliveryFee + (pricesIncludeTax ? 0 : taxAmount);

  return {
    subtotal,
    couponDiscount,
    discountedSubtotal,
    taxAmount: Math.round(taxAmount * 100) / 100,
    deliveryFee,
    total: Math.round(total * 100) / 100,
  };
}

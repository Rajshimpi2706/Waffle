'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, CartTopping } from '@/types';
import { generateId } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;
  subtotal: number;
  itemCount: number;

  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  mergeGuestCart: (serverItems: CartItem[]) => void;
}

const computeSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const toppingTotal = item.toppings.reduce((t, topping) => t + (Number(topping.price) || 0), 0);
    return sum + (unitPrice + toppingTotal) * (Number(item.quantity) || 0);
  }, 0);
};

const computeItemCount = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: undefined,
      couponDiscount: 0,
      subtotal: 0,
      itemCount: 0,

      addItem: (item) => {
        const numericUnitPrice = Number(item.unitPrice) || 0;
        const numericQuantity = Number(item.quantity) || 1;

        set((state) => {
          const existingIdx = state.items.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.variantId === item.variantId &&
              JSON.stringify(i.toppings.map((t) => t.id).sort()) ===
                JSON.stringify(item.toppings.map((t) => t.id).sort())
          );

          let newItems: CartItem[];
          if (existingIdx >= 0) {
            newItems = [...state.items];
            newItems[existingIdx] = {
              ...newItems[existingIdx],
              quantity: newItems[existingIdx].quantity + numericQuantity,
            };
          } else {
            newItems = [
              ...state.items,
              { ...item, id: generateId(), unitPrice: numericUnitPrice, quantity: numericQuantity }
            ];
          }

          return { 
            items: newItems,
            subtotal: computeSubtotal(newItems),
            itemCount: computeItemCount(newItems)
          };
        });
      },

      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return {
            items: newItems,
            subtotal: computeSubtotal(newItems),
            itemCount: computeItemCount(newItems)
          };
        }),

      updateQuantity: (id, quantity) => {
        const numericQuantity = Number(quantity);
        if (numericQuantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => {
          const newItems = state.items.map((i) => (i.id === id ? { ...i, quantity: numericQuantity } : i));
          return {
            items: newItems,
            subtotal: computeSubtotal(newItems),
            itemCount: computeItemCount(newItems)
          };
        });
      },

      clearCart: () => set({ items: [], couponCode: undefined, couponDiscount: 0, subtotal: 0, itemCount: 0 }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: Number(discount) || 0 }),

      removeCoupon: () => set({ couponCode: undefined, couponDiscount: 0 }),

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
          return { 
            items: merged,
            subtotal: computeSubtotal(merged),
            itemCount: computeItemCount(merged)
          };
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

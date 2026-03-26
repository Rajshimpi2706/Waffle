'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, generateId } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import { toast } from 'sonner';
import type { Product } from '@/types';

// Placeholder blur data URL
const blurDataURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8+vbnfwAHtAMFzD085QAAAABJRU5ErkJggg==';
const fallbackImage = 'https://images.unsplash.com/photo-1562376552-0d160a2f4277?q=80&w=600&auto=format&fit=crop';

export function ProductClient({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState(product.image_url || fallbackImage);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    (product.variants && product.variants.length > 0) ? product.variants[0].id : null
  );
  
  // Initialize default toppings
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    product.toppings?.forEach((t) => {
      // @ts-ignore - is_default might be in DB but not in minimal type
      if (t.is_default) defaults.add(t.id);
    });
    return defaults;
  });

  const addItem = useCartStore((state) => state.addItem);

  const isSoldOut = !product.is_available;

  const currentVariant = useMemo(() => {
    return product.variants?.find((v) => v.id === selectedVariantId);
  }, [product.variants, selectedVariantId]);

  // Total price logic: Base Product Price + Variant Modifier + Toppings
  const basePrice = Number(product.price) || 0;
  const variantModifier = currentVariant ? Number(currentVariant.price_modifier) : 0;

  const toppingsTotal = useMemo(() => {
    let total = 0;
    product.toppings?.forEach((t) => {
      if (selectedToppings.has(t.id)) {
        total += Number(t.price) || 0;
      }
    });
    return total;
  }, [product.toppings, selectedToppings]);

  const finalUnitPrice = basePrice + variantModifier + toppingsTotal;
  const totalPrice = finalUnitPrice * quantity;

  const handleToppingToggle = (toppingId: string) => {
    const next = new Set(selectedToppings);
    if (next.has(toppingId)) {
      next.delete(toppingId);
    } else {
      next.add(toppingId);
    }
    setSelectedToppings(next);
  };

  const handleAddToCart = () => {
    const toppingsToAdd = product.toppings
      ?.filter((t) => selectedToppings.has(t.id))
      .map((t) => ({
        id: generateId(),
        topping_id: t.id,
        name: t.name,
        price: Number(t.price) || 0,
      })) || [];

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      variantId: selectedVariantId || undefined,
      variantName: currentVariant?.name,
      quantity,
      unitPrice: basePrice + variantModifier, // Base price inclusive of variant
      toppings: toppingsToAdd,
    });

    toast.success(`${quantity}x ${product.name} added to cart!`, {
      action: {
        label: 'Checkout',
        onClick: () => window.location.href = '/checkout',
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
      <Link href="/menu" className="inline-flex items-center gap-2 text-[#8B5E3C] hover:text-[#C17839] transition-colors mb-6 font-medium">
        <ArrowLeft size={18} /> Back to Menu
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-[#F5E6CC] overflow-hidden flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/2 relative aspect-square bg-[#F5E6CC]">
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-xl px-6 py-2 uppercase tracking-widest">Sold Out</Badge>
            </div>
          )}
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover ${isSoldOut ? 'grayscale opacity-80' : ''}`}
            placeholder="blur"
            blurDataURL={blurDataURL}
            onError={() => setImgSrc(fallbackImage)}
            priority
          />
        </div>

        {/* Details Section */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              <span className="block w-2.5 h-2.5 rounded-full bg-green-600"></span> Veg
            </span>
            {product.is_featured && <Badge variant="gold">Bestseller</Badge>}
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-3">{product.name}</h1>
          <p className="text-[#8B5E3C] leading-relaxed mb-8">{product.description}</p>

          <div className="flex-grow space-y-8">
            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#3B1F0A] mb-3 flex items-center justify-between">
                  Size Options <span className="text-xs font-normal text-[#8B5E3C] bg-[#F5E6CC] px-2 py-0.5 rounded-full">Required</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={isSoldOut}
                      className={`flex flex-col p-3 rounded-xl border-2 text-left transition-all ${
                        selectedVariantId === v.id
                          ? 'border-[#C17839] bg-[#FDF6EC]'
                          : 'border-[#E5D5C0] hover:border-[#C17839] bg-white'
                      } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="font-medium text-[#3B1F0A]">{v.name}</span>
                      <span className="text-sm text-[#8B5E3C]">
                        {v.price_modifier > 0 ? `+${formatCurrency(v.price_modifier)}` : 'Standard'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings */}
            {product.toppings && product.toppings.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#3B1F0A] mb-3 flex items-center justify-between">
                  Add-ons & Toppings <span className="text-xs font-normal text-[#8B5E3C] bg-[#F5E6CC] px-2 py-0.5 rounded-full">Optional</span>
                </h3>
                <div className="space-y-2">
                  {product.toppings.map((t) => {
                    const isSelected = selectedToppings.has(t.id);
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleToppingToggle(t.id)}
                        disabled={isSoldOut || !t.is_available}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[#C17839] bg-[#FDF6EC]'
                            : 'border-[#E5D5C0] hover:border-[#C17839] bg-white'
                        } ${isSoldOut || !t.is_available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-[#C17839] border-[#C17839]' : 'border-[#C4A882]'}`}>
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                          <span className="font-medium text-[#3B1F0A]">{t.name}</span>
                        </div>
                        <span className="text-sm text-[#8B5E3C]">+{formatCurrency(t.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar on Mobile / Normal on Desktop */}
          <div className="mt-10 pt-6 border-t border-[#F0E0C8] sticky-bottom-cta md:relative md:p-0 md:bg-transparent md:border-t-0 md:z-auto bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#8B5E3C] font-semibold">Quantity</span>
              <div className="flex items-center gap-4 bg-[#F5E6CC] rounded-full p-1 border border-[#E5D5C0]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isSoldOut || quantity <= 1}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#3B1F0A] shadow-sm disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-4 text-center font-bold text-[#3B1F0A]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isSoldOut || quantity >= 10}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#3B1F0A] shadow-sm disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="xl"
              className="w-full flex justify-between items-center px-6"
              onClick={handleAddToCart}
              disabled={isSoldOut}
            >
              <span className="font-bold text-lg">{isSoldOut ? 'Sold Out' : 'Add to Cart'}</span>
              {!isSoldOut && (
                <span className="font-bold text-lg">{formatCurrency(totalPrice)}</span>
              )}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

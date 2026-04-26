'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { formatCurrency, truncate } from '@/lib/utils';
import { useCartStore } from '@/lib/cart';
import type { Product } from '@/types';

// Placeholder blur data URL for loading state
const blurDataURL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8+vbnfwAHtAMFzD085QAAAABJRU5ErkJggg==';
const fallbackImage = 'https://images.unsplash.com/photo-1562376552-0d160a2f4277?q=80&w=600&auto=format&fit=crop';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}

export function ProductCard({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState(product.image_url || fallbackImage);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image_url,
      quantity: 1,
      unitPrice: Number(product.price),
      toppings: [],
    });
    // Trigger cart drawer open via event
    document.dispatchEvent(new CustomEvent('open-cart'));
  };

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-soft border border-[#F5E6CC] group hover:shadow-premium hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative">
      {/* Glow Effect Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C17839]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Image Container with Glow */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#FDF6EC] m-2 sm:m-3 rounded-[1.5rem] sm:rounded-[2rem]">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgSrc(fallbackImage)}
        />
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {product.is_featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="gold" className="px-3 py-1 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.15em] rounded-full shadow-premium backdrop-blur-md bg-[#C17839]/90 border-none text-white">
              Bestseller
            </Badge>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <div className="bg-white/90 backdrop-blur-md text-[#22C55E] text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-[#22C55E]/20 flex items-center gap-1 sm:gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            VEG
          </div>
        </div>
      </div>

      {/* Content Architecture */}
      <div className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-5 md:pt-6 flex flex-col flex-1 relative z-10">
        <div className="min-h-[2.5rem] sm:min-h-[3.5rem] mb-2 sm:mb-4">
          <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#3B1F0A] group-hover:text-[#C17839] transition-colors tracking-tight line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>
        
        <div className="min-h-[2rem] sm:min-h-[2.5rem] mb-4 sm:mb-8">
          <p className="text-[12px] text-[#8B5E3C]/80 line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>
        </div>

        {/* Price + Add Button — always at bottom */}
        <div className="mt-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#A17C5F] font-black mb-0.5 sm:mb-1 opacity-60">Price</span>
            <span className="text-xl sm:text-2xl font-serif font-black text-[#3B1F0A]">₹{product.price}</span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            size="lg"
            className="rounded-full bg-[#3B1F0A] hover:bg-[#C17839] text-white px-5 sm:px-8 font-bold shadow-lg transition-all active:scale-90 min-h-[44px] text-sm"
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

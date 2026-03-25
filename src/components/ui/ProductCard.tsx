'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { formatCurrency, truncate } from '@/lib/utils';
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

export function ProductCard({ product, onAddToCart, onCustomize }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.image_url || fallbackImage);

  const hasCustomization = (product.variants && product.variants.length > 0) ||
                           (product.toppings && product.toppings.length > 0);

  const isSoldOut = product.is_sold_out || !product.is_available;

  return (
    <div className="card group relative flex flex-col overflow-hidden h-full">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.is_featured && <Badge variant="gold">Bestseller</Badge>}
        {product.is_vegetarian ? (
          <span className="bg-white/90 backdrop-blur p-1 rounded border border-green-600 shadow-sm" title="Vegetarian">
            <span className="block w-2.5 h-2.5 rounded-full bg-green-600"></span>
          </span>
        ) : (
           <span className="bg-white/90 backdrop-blur p-1 rounded border border-red-600 shadow-sm" title="Non-Vegetarian">
            <span className="block w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-red-600"></span>
          </span>
        )}
      </div>

      {/* Image Container */}
      <Link href={`/menu/${product.slug}`} className="relative aspect-[4/3] w-full bg-[#F5E6CC] block overflow-hidden">
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center backdrop-blur-[2px]">
            <Badge variant="destructive" className="text-sm px-4 py-1 uppercase tracking-wider">Sold Out</Badge>
          </div>
        )}
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 ${!isSoldOut ? 'group-hover:scale-105' : 'opacity-70 grayscale'}`}
          placeholder="blur"
          blurDataURL={blurDataURL}
          loading="lazy"
          onError={() => setImgSrc(fallbackImage)}
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5 self-stretch">
        <Link href={`/menu/${product.slug}`} className="block">
          <h3 className="font-serif text-lg font-semibold text-[#3B1F0A] mb-1 line-clamp-1 hover:text-[#C17839] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-[#8B5E3C] mb-4 line-clamp-2">
          {product.description || 'Delicious, made-to-order belgian waffle.'}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-[#A8662D] font-medium leading-tight">Starting from</span>
            <span className="text-xl font-bold text-[#3B1F0A]">
              {formatCurrency(product.base_price)}
            </span>
          </div>

          {!isSoldOut && (
            hasCustomization ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCustomize?.(product)}
                className="rounded-full px-5 uppercase text-xs tracking-wide"
              >
                Add +
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAddToCart?.(product)}
                className="rounded-full px-5 uppercase text-xs tracking-wide"
              >
                Add
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

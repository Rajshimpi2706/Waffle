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
      unitPrice: product.base_price,
      toppings: [],
    });
    // Trigger cart drawer open via event
    document.dispatchEvent(new CustomEvent('open-cart'));
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#F5E6CC] group hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#FDF6EC]">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImgSrc(fallbackImage)}
        />
        {product.is_featured && (
          <div className="absolute top-4 left-4">
            <Badge variant="gold" className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm">
              Bestseller
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-xl font-bold text-[#3B1F0A] group-hover:text-[#C17839] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            VEG
          </span>
        </div>
        
        <p className="text-sm text-[#8B5E3C] mb-6 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#A17C5F] font-bold">Price</span>
            <span className="text-xl font-bold text-[#3B1F0A]">₹{product.base_price}</span>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            className="rounded-full bg-[#3B1F0A] hover:bg-[#C17839] text-white px-6 py-2 h-auto text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

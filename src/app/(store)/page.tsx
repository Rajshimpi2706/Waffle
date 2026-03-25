import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, ShoppingBag, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS } from '@/data/products';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  const featuredProducts = PRODUCTS.filter(p => p.is_featured).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#3B1F0A]">
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C17839]/20 border border-[#C17839]/30 text-[#F0BC5E] text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in shadow-xl backdrop-blur-md">
            <Star size={14} className="fill-[#F0BC5E]" />
            Premium Belgian Waffles
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-[1.1] animate-fade-in drop-shadow-2xl">
            Waffle <span className="text-[#C17839]">Wala</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#FDF6EC]/90 mb-10 max-w-2xl mx-auto font-medium italic animate-fade-in" style={{ animationDelay: '100ms' }}>
            "Har Bite Mein Happiness"
          </p>

          <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in hidden md:block" style={{ animationDelay: '200ms' }}>
            Experience the crunch of authentic Belgian waffles, drizzled with premium chocolate and topped with pure joy. Freshly baked, just for you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in w-full max-w-md mx-auto" style={{ animationDelay: '300ms' }}>
            <Link href="/menu" className="w-full sm:w-auto">
              <Button size="xl" className="w-full sm:w-auto text-lg rounded-full px-12 bg-[#C17839] hover:bg-[#A8662D] text-white border-none shadow-2xl transition-all active:scale-95 flex items-center gap-2">
                Order Now <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FDF6EC] to-transparent z-0" />
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-[#FDF6EC] border-b border-[#F5E6CC]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#C17839] border border-[#F5E6CC]">
                <Zap size={28} />
              </div>
              <h3 className="font-bold text-[#3B1F0A] text-sm">Fast Delivery</h3>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#C17839] border border-[#F5E6CC]">
                <Star size={28} />
              </div>
              <h3 className="font-bold text-[#3B1F0A] text-sm">Premium Quality</h3>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#C17839] border border-[#F5E6CC]">
                <ShoppingBag size={28} />
              </div>
              <h3 className="font-bold text-[#3B1F0A] text-sm">Freshly Baked</h3>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#C17839] border border-[#F5E6CC]">
                <span className="text-2xl font-bold">100%</span>
              </div>
              <h3 className="font-bold text-[#3B1F0A] text-sm">Vegetarian</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-4">Our Bestsellers</h2>
            <div className="w-24 h-1.5 bg-[#C17839] mx-auto rounded-full mb-6" />
            <p className="text-[#8B5E3C] max-w-xl mx-auto">Discover the waffles that have won hearts across the city.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/menu">
              <Button variant="outline" size="xl" className="rounded-full border-2 border-[#3B1F0A] text-[#3B1F0A] hover:bg-[#3B1F0A] hover:text-white px-12 font-bold transition-all">
                Explore Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function TestimonialCard({ text, author, rating }: { text: string, author: string, rating: number }) {
  return (
    <div className="bg-[#FDF6EC] p-8 rounded-3xl text-left shadow-sm border border-[#F5E6CC]">
      <div className="flex gap-1 mb-6 text-[#E8A535]">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={20} fill="currentColor" />
        ))}
      </div>
      <p className="text-[#3B1F0A] italic mb-6 leading-relaxed">"{text}"</p>
      <p className="font-semibold text-[#8B5E3C]">- {author}</p>
    </div>
  );
}

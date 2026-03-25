import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

// Force dynamic fetch for the homepage to ensure latest featured items
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .limit(4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/waffle2.png"
            alt="Delicious Belgian Waffles"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" /> {/* Dark overlay */}
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center">
          <Badge variant="gold" className="mb-6 animate-fade-in inline-flex py-1 px-4 text-xs font-bold uppercase tracking-widest">
            Handcrafted with love
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-fade-in drop-shadow-md" style={{ animationDelay: '100ms' }}>
            The Perfect Crunch in <br className="hidden md:block" /> Every Bite.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            Experience authentic Belgian waffles, freshly baked daily using premium ingredients and topped with pure decadence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link href="/menu">
              <Button size="xl" variant="primary" className="w-full sm:w-auto text-lg rounded-full px-8 drop-shadow-lg">
                Order Now
              </Button>
            </Link>
            <Link href="/menu#bestsellers">
              <Button size="xl" variant="secondary" className="w-full sm:w-auto text-lg rounded-full px-8 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md">
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Banner */}
      <section className="bg-[#3B1F0A] text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="bg-[#C17839] text-white p-3 rounded-xl">
                <span className="font-serif text-2xl font-bold">%</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Get 10% Off</h3>
                <p className="text-white/70 text-sm">Use code <strong className="text-[#E8A535]">WAFFLE10</strong> on orders above ₹99.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
               <div className="bg-[#E8A535] text-[#3B1F0A] p-3 rounded-xl">
                <Star size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">First Time?</h3>
                <p className="text-white/70 text-sm">Flat ₹50 off on your first order. Code: <strong className="text-[#E8A535]">FIRSTWAFFLE</strong></p>
              </div>
            </div>
            <div className="hidden lg:flex items-start gap-4 p-6 rounded-2xl bg-[#C17839]/20 border border-[#C17839]/30">
              <div className="bg-white text-[#C17839] p-3 rounded-xl">
                <span className="font-serif text-2xl font-bold">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1 text-[#F0BC5E]">Fast Delivery</h3>
                <p className="text-white/70 text-sm">Hot & crispy waffles delivered in under 45 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#FDF6EC]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-3">Chef's Specials</h2>
              <p className="text-[#8B5E3C] max-w-xl">Our most loved creations, handpicked for you. Guaranteed to satisfy your sweet tooth.</p>
            </div>
            <Link href="/menu" className="hidden md:flex items-center gap-2 text-[#C17839] font-medium hover:text-[#A8662D] transition-colors">
              See All Menu <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                product={product as Product}
              />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/menu">
              <Button variant="outline" className="w-full rounded-full">
                Explore Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white border-t border-[#F5E6CC]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <TestimonialCard
              text="Hands down the best waffles I've had in the city! The Lotus Biscoff waffle is an absolute game-changer. Crispy on the outside, perfectly soft inside."
              author="Priya S."
              rating={5}
            />
            <TestimonialCard
              text="Ordered delivery and was worried it would be soggy, but they arrived piping hot and still crispy! Packaging is premium. Excellent service."
              author="Rahul M."
              rating={5}
            />
            <TestimonialCard
              text="The Dark Choco Fudge is heaven for chocolate lovers. Generous toppings and perfectly balanced sweetness. My new go-to dessert place."
              author="Anika K."
              rating={5}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  // Simple local badge for the hero section to avoid client-side imports in this async server component
  const colors = variant === 'gold' ? 'bg-[#E8A535] text-[#3B1F0A]' : 'bg-white text-black';
  return <span className={`${colors} ${className}`}>{children}</span>;
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

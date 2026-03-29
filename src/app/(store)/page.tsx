import Link from 'next/link';
import { Star, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { PRODUCTS } from '@/data/products';
import { HeroExperience } from '@/components/ui/HeroExperience';

export default function HomePage() {
  const featuredProducts = PRODUCTS.filter(p => p.is_featured).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDF6EC]">
      {/* 3D Premium Hero Showcase Architecture */}
      <HeroExperience />

      {/* Premium Trust Architecture Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5E6CC] to-transparent" />
        <div className="safe-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-20 h-20 rounded-[2.5rem] bg-[#FDF6EC] flex items-center justify-center text-[#C17839] mb-8 transition-all duration-700 group-hover:bg-[#3B1F0A] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-soft">
                <Zap size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3B1F0A] mb-3 tracking-tight transition-colors duration-500 group-hover:text-[#C17839]">Express Delivery</h3>
              <p className="text-[10px] text-[#8B5E3C] font-black uppercase tracking-[0.2em] opacity-50">Hot & Fresh in 30 Min</p>
            </div>

            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-20 h-20 rounded-[2.5rem] bg-[#FDF6EC] flex items-center justify-center text-[#C17839] mb-8 transition-all duration-700 group-hover:bg-[#3B1F0A] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-soft">
                <Star size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3B1F0A] mb-3 tracking-tight transition-colors duration-500 group-hover:text-[#C17839]">Premium Quality</h3>
              <p className="text-[10px] text-[#8B5E3C] font-black uppercase tracking-[0.2em] opacity-50">Highest Graded Cocoa</p>
            </div>

            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-20 h-20 rounded-[2.5rem] bg-[#FDF6EC] flex items-center justify-center text-[#C17839] mb-8 transition-all duration-700 group-hover:bg-[#3B1F0A] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-soft">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3B1F0A] mb-3 tracking-tight transition-colors duration-500 group-hover:text-[#C17839]">Secure Payment</h3>
              <p className="text-[10px] text-[#8B5E3C] font-black uppercase tracking-[0.2em] opacity-50">100% Encrypted Pay</p>
            </div>

            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-20 h-20 rounded-[2.5rem] bg-[#FDF6EC] flex items-center justify-center text-[#C17839] mb-8 transition-all duration-700 group-hover:bg-[#3B1F0A] group-hover:text-white group-hover:rotate-12 group-hover:scale-110 shadow-soft">
                <span className="text-3xl font-serif font-black">V</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#3B1F0A] mb-3 tracking-tight transition-colors duration-500 group-hover:text-[#C17839]">100% Vegetarian</h3>
              <p className="text-[10px] text-[#8B5E3C] font-black uppercase tracking-[0.2em] opacity-50">Pure & Safe Indulgence</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5E6CC] to-transparent" />
      </section>

      {/* Featured Bestsellers Section Architecture */}
      <section className="py-32 bg-[#FDF6EC] relative">
        <div className="safe-container">
          <div className="text-center mb-24 animate-fade-in">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-[#3B1F0A] mb-6 tracking-tighter">
               Our <span className="text-[#C17839]">Bestsellers.</span>
            </h2>
            <div className="flex items-center justify-center gap-4 mb-10">
               <div className="h-[1.5px] w-20 bg-gradient-to-r from-transparent to-[#C17839]" />
               <Star size={18} className="fill-[#C17839] text-[#C17839] opacity-40" />
               <div className="h-[1.5px] w-20 bg-gradient-to-l from-transparent to-[#C17839]" />
            </div>
            <p className="text-[#8B5E3C] max-w-2xl mx-auto text-xl font-medium italic leading-relaxed opacity-80">
              "A symphony of crunch and chocolate, crafted to perfection for your moments of pure joy."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-14">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link href="/menu">
              <Button size="xl" className="h-16 rounded-3xl px-16 bg-[#3B1F0A] hover:bg-black text-white shadow-premium hover:-translate-y-2 transition-all group active:scale-95 font-black uppercase tracking-widest text-[10px]">
                Explore Gallery
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

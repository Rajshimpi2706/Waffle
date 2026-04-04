'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Star, Heart, Clock, Utensils } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDF6EC]">
      {/* Hero Section */}
      <section className="relative py-24 bg-[#3B1F0A] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(193,120,57,0.15)_0%,transparent_70%)]" />
        <div className="safe-container relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6">
            Our <span className="text-[#C17839]">Story.</span>
          </h1>
          <p className="text-[#FDF6EC]/70 max-w-2xl mx-auto text-lg italic leading-relaxed">
            "From a small kitchen to your favorite waffle destination, we've always believed that every bite should bring happiness."
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-white">
        <div className="safe-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#FDF6EC]">
               <Image 
                 src="/images/shop1.png" 
                 alt="Waffle Making" 
                 fill 
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                 className="object-cover"
               />
            </div>
            <div className="flex flex-col gap-8">
              <h2 className="text-4xl font-serif font-black text-[#3B1F0A]">A Passion for Perfection</h2>
              <p className="text-[#8B5E3C] leading-relaxed text-lg font-medium opacity-80">
                At Waffle Wala, we don't just make waffles; we create experiences. Our journey started with a simple goal: to serve the crispest, most flavorful waffles using only the finest ingredients.
              </p>
              <p className="text-[#8B5E3C] leading-relaxed text-lg font-medium opacity-80">
                Every batch of our secret-recipe batter is made fresh daily, and our toppings are sourced responsibly to ensure that you get nothing but the best. Whether it's our Classic Belgian or our indulgent Triple Chocolate Blast, quality is at the heart of everything we do.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDF6EC] rounded-lg text-[#C17839]"><Heart size={20} /></div>
                  <span className="font-bold text-[#3B1F0A]">Made with Love</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDF6EC] rounded-lg text-[#C17839]"><Star size={20} /></div>
                  <span className="font-bold text-[#3B1F0A]">Premium Quality</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDF6EC] rounded-lg text-[#C17839]"><Clock size={20} /></div>
                  <span className="font-bold text-[#3B1F0A]">Always Fresh</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FDF6EC] rounded-lg text-[#C17839]"><Utensils size={20} /></div>
                  <span className="font-bold text-[#3B1F0A]">Artisanal Touch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#FDF6EC]">
        <div className="safe-container text-center">
          <h3 className="text-3xl font-serif font-bold text-[#3B1F0A] mb-8">Ready to taste the happiness?</h3>
          <Link href="/menu">
            <Button size="xl" className="rounded-full px-12 bg-[#3B1F0A] text-white">Browse Menu</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

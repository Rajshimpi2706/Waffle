'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { Button } from './Button';
import { PRODUCTS } from '@/data/products';

const HERO_PRODUCTS = PRODUCTS.filter(p => [
  'Classic Waffle',
  'Double Chocolate Delight',
  'Triple Chocolate Blast',
  'Oreo Crunch'
].includes(p.name)).slice(0, 4);

export function HeroExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev: number) => (prev + 1) % HERO_PRODUCTS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 2000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  if (!mounted) return null;

  return (
    <section
      className="relative viewport-section bg-[#3B1F0A] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Glow Architecture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(193,120,57,0.18)_0%,transparent_75%)] pointer-events-none" />

      {/* Texture Architecture */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
      </div>

      {/* Main grid — stacks on mobile, side-by-side on desktop */}
      <div className="safe-container relative z-10 grid lg:grid-cols-2 lg:items-center gap-6 sm:gap-10 lg:gap-24 pt-6 pb-8 sm:pt-8 sm:pb-12 lg:pt-[30px] lg:pb-24">
        
        {/* Content Side Architecture */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in relative z-30 pointer-events-auto">
          
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-full bg-[#C17839]/15 border border-[#C17839]/30 text-[#F0BC5E] text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-3 shadow-2xl backdrop-blur-xl">
            <Star size={12} className="fill-[#F0BC5E]" />
            Premium Waffles
          </div>

          {/* Responsive heading — prevents over-size on 320px */}
          <h1 className="text-[2.25rem] xs:text-4xl sm:text-5xl md:text-8xl lg:text-[7rem] font-serif font-black text-white mb-3 md:mb-4 leading-[0.9] tracking-tighter drop-shadow-2xl">
            Har Bite Mein <br />
            <span className="text-[#E8A535]">Happiness.</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-xl text-[#FDF6EC]/70 mb-6 md:mb-10 max-w-sm sm:max-w-xl font-medium italic leading-relaxed px-2 sm:px-4 md:px-0">
            &ldquo;Experience the sophisticated crunch of authentic Premium waffles, elegantly drizzled with the world&apos;s finest cocoa.&rdquo;
          </p>

          {/* CTAs — full-width on very small screens, auto on larger */}
          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch xs:items-center gap-3 sm:gap-4 md:gap-6 w-full max-w-[320px] xs:max-w-none">
            <Link href="/menu" className="flex-1 xs:flex-none">
              <Button size="xl" className="w-full xs:w-auto h-12 sm:h-14 md:h-16 rounded-2xl md:rounded-3xl px-6 sm:px-10 md:px-14 bg-[#C17839] hover:bg-[#A8662D] text-white border-none shadow-premium transition-all hover:-translate-y-1 active:scale-95 group font-black uppercase tracking-widest text-[10px]">
                Begin Journey
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/menu" className="flex-1 xs:flex-none">
              <Button size="xl" variant="outline" className="w-full xs:w-auto h-12 sm:h-14 md:h-16 rounded-2xl md:rounded-3xl px-6 sm:px-10 md:px-14 border-white/20 text-white hover:bg-white/10 backdrop-blur-md font-black uppercase tracking-widest text-[10px]">
                Explore Gallery
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 md:mt-14 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 opacity-40">
            <div className="flex items-center gap-2 text-white text-[10px] font-black tracking-widest uppercase">
              <Zap size={13} className="text-[#E8A535]" /> Artisanal
            </div>
            <div className="flex items-center gap-2 text-white text-[10px] font-black tracking-widest uppercase">
              <ShieldCheck size={13} className="text-[#E8A535]" /> Encrypted
            </div>
            <div className="flex items-center gap-2 text-white text-[10px] font-black tracking-widest uppercase">
              <Star size={13} className="text-[#E8A535]" /> Express
            </div>
          </div>
        </div>

        {/* 3D Visual Side Architecture — shorter on mobile */}
        <div className="relative h-[260px] sm:h-[340px] lg:h-[600px] flex items-center justify-center hero-container group/carousel pointer-events-none">
          <div className="waffle-spotlight opacity-50 scale-125 select-none" />

          {isMobile ? (
            /* Simplified Mobile View */
            <div className="relative w-full h-full flex items-center justify-center animate-fade-in pointer-events-none">
              <div className="relative scale-90">
                <Image
                  src={HERO_PRODUCTS[activeIndex].image_url || '/placeholder.png'}
                  alt={HERO_PRODUCTS[activeIndex].name}
                  width={320}
                  height={320}
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                  priority
                />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-6 bg-black/40 blur-2xl rounded-[100%] scale-x-150 opacity-60" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#3B1F0A]/85 backdrop-blur-xl px-4 py-1.5 rounded-full text-white text-[10px] font-black tracking-widest uppercase whitespace-nowrap shadow-2xl">
                  {HERO_PRODUCTS[activeIndex].name}
                </div>
              </div>
            </div>
          ) : (
            /* Desktop 3D Cylinder */
            <div
              className="carousel-3d"
              style={{ transform: `rotateY(${activeIndex * -60}deg)` }}
            >
              {HERO_PRODUCTS.map((product, idx) => {
                const isCentered = activeIndex === idx;
                return (
                  <div
                    key={product.id}
                    className="carousel-item"
                    style={{
                      transform: `rotateY(${idx * 60}deg) translateZ(clamp(200px, 35vw, 450px))`,
                      opacity: isCentered ? 1 : 0.4,
                      filter: isCentered ? 'blur(0)' : 'blur(4px)',
                      zIndex: isCentered ? 10 : 0
                    }}
                  >
                    <div className="relative w-full h-full p-6 flex items-center justify-center transition-all duration-1000">
                      <div className={`relative transition-all duration-1000 ${isCentered ? 'scale-110' : 'scale-90 opacity-40'}`}>
                        <Image
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          width={500}
                          height={500}
                          className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                          priority={idx === 0}
                        />
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/40 blur-2xl rounded-[100%] scale-x-150 opacity-60" />
                      </div>
                      <div className={`absolute -bottom-24 left-1/2 -translate-x-1/2 bg-[#3B1F0A]/40 backdrop-blur-2xl border border-white/10 px-6 py-2.5 rounded-full text-white text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl transition-all duration-1000 ${isCentered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {product.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Precision Navigation */}
          <div className="absolute bottom-2 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-40 pointer-events-auto">
            {HERO_PRODUCTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-700 ${activeIndex === i
                  ? 'bg-[#E8A535] w-10'
                  : 'bg-white/10 w-3 hover:bg-white/30'
                  }`}
                aria-label={`Switch to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Atmospheric Depth Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-[#3B1F0A] via-[#3B1F0A]/40 to-transparent z-10 pointer-events-none hidden lg:block" />
      <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-l from-[#3B1F0A] via-[#3B1F0A]/40 to-transparent z-10 pointer-events-none hidden lg:block" />

      {/* Seamless Store Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-15 bg-gradient-to-t from-[#FDF6EC] to-transparent z-20" />
    </section>
  );
}

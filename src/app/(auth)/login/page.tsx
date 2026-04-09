import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCanvas } from './AuthCanvas';

export const metadata = {
  title: 'Secure Log In | Waffle Wala',
  description: 'Log in to securely check out and track your Waffle Wala orders.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-[#fdfaf5] overflow-hidden font-sans relative">

      {/* Left Side: Brand & Trust Copy */}
      <div className="w-full md:w-[42%] lg:w-[38%] bg-gradient-to-br from-[#1e0d06] via-[#2a1306] to-[#3d1f0a] text-white p-8 md:p-14 lg:p-20 flex flex-col relative overflow-hidden shrink-0 z-10 border-r border-white/5 shadow-2xl">

        {/* Animated Amber Glow */}
        <div className="absolute -bottom-[10%] left-[10%] w-[130%] h-[60%] bg-[#b47a46] rounded-full blur-[120px] opacity-30 pointer-events-none animate-pulse" />

        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="inline-block group cursor-pointer mb-16 md:mb-24 transition-transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C17839] rounded-xl flex items-center justify-center shadow-lg shadow-black/20 group-hover:rotate-6 transition-transform">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm-1-11v2H9v2h2v2h2v-2h2v-2h-2V9h-2zm-4 4h2v2H7v-2zm8 0h2v2h-2v-2zm-4-4h2v2h-2V9z" />
                </svg>
              </div>
              <div>
                <span className="font-serif text-5xl md:text-4xl font-black tracking-tight text-white/95 leading-none">
                  Waffle Wala
                </span>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#C17839] mt-1.5 font-black">
                  Har Bite Mein Happiness
                </p>
              </div>
            </div>
          </Link>

          <div className="space-y-6 hidden md:block">
            <h1 className="text-[2.85rem] lg:text-[3.5rem] font-serif font-black leading-[1.1] text-white tracking-tight text-balance">
              Unlock the Sweetest <br /> Experience.
            </h1>
            <p className="text-[#d8bca6] font-normal leading-relaxed text-[17px] pr-8 max-w-lg opacity-80">
              Join us to safely secure your orders, track your cravings in real-time, and save your favorite treats.
            </p>
          </div>

          <div className="relative z-10 hidden md:flex flex-col gap-10 mt-20 flex-1">
            <div className="flex items-start gap-7 group">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-0.5 shadow-xl transition-all group-hover:bg-white/5 group-hover:border-white/40">
                <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" /></svg>
              </div>
              <div className="pt-1">
                <p className="text-white font-bold text-[18px] mb-1.5 tracking-tight">Encrypted Checkout</p>
                <p className="text-[14px] text-[#A68F81] leading-relaxed max-w-[280px]">Security checkout your encrypted<br />and check your orders.</p>
              </div>
            </div>

            <div className="flex items-start gap-7 group">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-0.5 shadow-xl transition-all group-hover:bg-white/5 group-hover:border-white/40">
                <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="pt-1">
                <p className="text-white font-bold text-[18px] mb-1.5 tracking-tight">Fast One-Tap Order</p>
                <p className="text-[14px] text-[#A68F81] leading-relaxed max-w-[280px]">Fast · one-tap cravings, and save<br />your favorite treats.</p>
              </div>
            </div>

            <div className="flex items-start gap-7 group">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-0.5 shadow-xl transition-all group-hover:bg-white/5 group-hover:border-white/40">
                <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <div className="pt-1">
                <p className="text-white font-bold text-[18px] mb-1.5 tracking-tight">Digital Receipt Vault</p>
                <p className="text-[14px] text-[#A68F81] leading-relaxed max-w-[280px]">Digital receipt vault history and<br />your business details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form with Premium Background */}
      <div className="w-full md:w-[58%] lg:w-[62%] relative flex items-start justify-center min-h-screen px-4 md:px-12 bg-white overflow-hidden pt-12 md:pt-24 lg:pt-32">

        {/* The Waffle Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/waffle-auth-bg.png"
            alt="Waffle Background"
            className="w-full h-full object-cover scale-110 blur-[2px] opacity-90"
          />
          {/* Subtle overlay to soften the image and match the cream depth */}
          <div className="absolute inset-0 bg-[#fdfaf5]/40 backdrop-blur-[1px]" />

          {/* Warm gradients to blend edges */}
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#f5e6d3]/60 rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-[#ebd3b9]/50 rounded-full blur-[130px] pointer-events-none translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Glassmorphism Card (Redesigned to match image) */}
        <div className="w-full max-w-[460px] bg-white/65 backdrop-blur-2xl border border-white/40 shadow-[0_20px_60px_-15px_rgba(59,31,10,0.15)] rounded-[2rem] p-8 md:p-12 relative z-20">
          <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#C17839] border-t-transparent rounded-full animate-spin" /></div>}>
            <AuthCanvas />
          </Suspense>
        </div>
      </div>

    </div>
  );
}

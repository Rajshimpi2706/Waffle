import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCanvas } from './AuthCanvas';

export const metadata = {
  title: 'Secure Log In | Waffle Wala',
  description: 'Log in to securely check out and track your Waffle Wala orders.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-[#fdfaf5] overflow-hidden font-sans">
      
      {/* Left Side: Brand & Trust Copy */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-gradient-to-b from-[#251206] to-[#3a1d0a] text-white p-8 md:p-14 lg:p-20 flex flex-col relative overflow-hidden shrink-0">
        
        {/* Glowing effect at bottom */}
        <div className="absolute -bottom-[15%] left-[10%] w-[120%] h-[60%] bg-[#b47a46] rounded-full blur-[100px] opacity-40 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="inline-block group cursor-pointer mb-16 md:mb-24">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-[#C17839]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm-1-11v2H9v2h2v2h2v-2h2v-2h-2V9h-2zm-4 4h2v2H7v-2zm8 0h2v2h-2v-2zm-4-4h2v2h-2V9z" />
              </svg>
              <div>
                <span className="font-serif text-2xl font-semibold tracking-tight text-[#f5ebd9] group-hover:text-white transition-colors duration-500">
                  Waffle Wala
                </span>
                <p className="text-[8px] uppercase tracking-[0.2em] text-[#b47a46] mt-0.5 font-medium">
                  Har Bite Mein Happiness
                </p>
              </div>
            </div>
          </Link>

          <div className="space-y-6 hidden md:block">
            <h1 className="text-[2.75rem] font-serif font-bold leading-[1.1] text-white tracking-tight">
              Unlock the Sweetest <br/> Experience.
            </h1>
            <p className="text-[#d8bca6] font-normal leading-relaxed text-[15px] pr-8 max-w-md">
              Join us to safely secure your orders, track your cravings in real-time, and save your favorite treats.
            </p>
          </div>

          <div className="relative z-10 hidden md:flex flex-col gap-8 mt-16 flex-1">
            <div className="flex items-start gap-5">
              <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-[15px] mb-1">Encrypted Checkout</p>
                <p className="text-[13px] text-[#A68F81] leading-snug">Security checkout your encrypted<br/>and check your orders.</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-[15px] mb-1">Fast One-Tap Order</p>
                <p className="text-[13px] text-[#A68F81] leading-snug">Fast · one-tap cravings , and save<br/>your favorite treats.</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <div>
                <p className="text-white font-semibold text-[15px] mb-1">Digital Receipt Vault</p>
                <p className="text-[13px] text-[#A68F81] leading-snug">Digital receipt vault history and<br/>your business details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full md:w-[55%] lg:w-[60%] relative flex items-center justify-center min-h-screen px-4 md:px-12 bg-[#Fdfbf7]">
        {/* Subtle background abstract shapes to mimic the creamy image depth */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#f5e6d3]/60 rounded-full blur-[80px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#ebd3b9]/40 rounded-full blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#faebd7]/50 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        {/* Glassmorphism Card */}
        <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-8 md:p-10 relative z-20">
          <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#C17839] border-t-transparent rounded-full animate-spin" /></div>}>
            <AuthCanvas />
          </Suspense>
        </div>
      </div>

    </div>
  );
}

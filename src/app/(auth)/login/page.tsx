import { Suspense } from 'react';
import Link from 'next/link';
import { AuthCanvas } from './AuthCanvas';

export const metadata = {
  title: 'Secure Log In | Waffle Wala',
  description: 'Log in to securely check out and track your Waffle Wala orders.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex md:items-center justify-center p-0 md:p-6 lg:p-10 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C17839]/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#3B1F0A]/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white md:rounded-[3rem] shadow-premium border border-[#F5E6CC] relative z-10 overflow-hidden min-h-screen md:min-h-[750px]">
        
        {/* Left Side: Brand & Trust Copy (Hidden on very small screens, integrated on mobile) */}
        <div className="w-full md:w-[45%] bg-[#3B1F0A] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4A2810] to-[#2A1505]" />
          <div className="absolute top-0 left-0 w-full h-[300px] bg-[#C17839]/20 blur-[80px] -translate-y-1/2" />
          
          <div className="relative z-10">
            <Link href="/" className="inline-block group cursor-pointer mb-12">
              <span className="font-serif text-3xl md:text-4xl font-black tracking-tight text-white group-hover:text-[#C17839] transition-colors duration-500 leading-none">
                Waffle<span className="text-[#C17839] group-hover:text-white transition-colors duration-500">Wala</span>.
              </span>
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/50 mt-2">
                Har Bite Mein Happiness
              </p>
            </Link>

            <div className="space-y-6 hidden md:block mt-16">
               <h2 className="text-4xl font-serif font-black leading-tight text-white">
                 Unlock the <br/><span className="text-[#C17839]">Sweetest</span> Experience.
               </h2>
               <p className="text-white/70 font-medium leading-relaxed italic text-lg pr-4">
                 "Join us to safely secure your orders, track your cravings in real-time, and save your favorite treats."
               </p>
            </div>
          </div>

          <div className="relative z-10 hidden md:flex flex-col gap-6">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C17839]">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                 <p className="font-bold">Encrypted Checkout</p>
                 <p className="text-xs text-white/50">Your payments are 100% secure</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C17839]">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <div>
                 <p className="font-bold">Fast One-Tap Order</p>
                 <p className="text-xs text-white/50">Save details for quicker cravings</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#C17839]">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
               </div>
               <div>
                 <p className="font-bold">Digital Receipt Vault</p>
                 <p className="text-xs text-white/50">Access past orders anytime</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full md:w-[55%] p-6 pt-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
           <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#C17839] border-t-transparent rounded-full animate-spin" /></div>}>
             <AuthCanvas />
           </Suspense>
        </div>

      </div>
    </div>
  );
}

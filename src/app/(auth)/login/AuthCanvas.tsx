'use client';

import { useState } from 'react';
import { PhoneLogin } from '@/components/auth/PhoneLogin';
import { OTPVerify } from '@/components/auth/OTPVerify';
import { GoogleLogin } from '@/components/auth/GoogleLogin';

export function AuthCanvas() {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full max-w-[420px] mx-auto animate-fade-in relative z-20">
      
      {/* Mobile-only header (Desktop shows it on the left panel) */}
      <div className="md:hidden text-center mb-10">
        <h1 className="text-3xl font-serif font-black text-[#3B1F0A] mb-3">Welcome Back</h1>
        <p className="text-[#8B5E3C] text-sm font-medium italic">
          "Sign in to secure your order and track your happiness."
        </p>
      </div>

      <div className="hidden md:block mb-10">
        <h1 className="text-4xl font-serif font-black text-[#3B1F0A] mb-3">Login / Signup</h1>
        <p className="text-[#8B5E3C] text-sm font-medium">Use your mobile number or Google account to continue.</p>
      </div>

      <div className="relative">
        <div className={`transition-all duration-500 absolute w-full ${step === 'PHONE' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 -z-10 -translate-x-8 pointer-events-none'}`}>
          <PhoneLogin 
            onSuccess={(p) => {
              setPhone(p);
              setStep('OTP');
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          <div className="my-8 flex items-center gap-4 before:h-[1px] before:flex-1 before:bg-[#F5E6CC] after:h-[1px] after:flex-1 after:bg-[#F5E6CC]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A17C5F]">OR</span>
          </div>

          <GoogleLogin />
        </div>

        <div className={`transition-all duration-500 absolute w-full ${step === 'OTP' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 -z-10 translate-x-8 pointer-events-none'}`}>
          {step === 'OTP' && (
            <OTPVerify 
              phone={phone}
              onBack={() => setStep('PHONE')}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          )}
        </div>
        
        {/* Placeholder to reserve height for absolute positioning */}
        <div className="invisible">
          <PhoneLogin onSuccess={() => {}} isLoading={false} setIsLoading={() => {}} />
          <div className="my-8 h-[20px]" />
          <GoogleLogin />
        </div>
      </div>

      <p className="mt-12 text-center text-[10px] uppercase font-black tracking-widest text-[#A17C5F]/60">
        By continuing, you agree to our <br className="md:hidden"/> Terms of Service & Privacy Policy.
      </p>
    </div>
  );
}

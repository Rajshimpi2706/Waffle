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
    <div className="w-full mx-auto animate-fade-in relative z-20 flex flex-col">
      
      {/* Header sections fully centered to match image */}
      <div className="text-center mb-8 mt-2">
        <h1 className="text-[2.2rem] font-serif font-bold text-[#2a1306] mb-3 tracking-tight">Login / Signup</h1>
        <p className="text-[#4a2e1b] text-[14.5px] max-w-[260px] mx-auto leading-snug">
          Use your mobile number or Google account to continue.
        </p>
      </div>

      <div className="relative w-full">
        <div className={`transition-all duration-500 absolute w-full ${step === 'PHONE' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 -z-10 -translate-x-8 pointer-events-none'}`}>
          <PhoneLogin 
            onSuccess={(p) => {
              setPhone(p);
              setStep('OTP');
            }}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />

          <div className="my-7 flex items-center gap-3 before:h-[1px] before:flex-1 before:bg-[#e4d4c4] after:h-[1px] after:flex-1 after:bg-[#e4d4c4]">
            <span className="text-[11px] font-medium uppercase tracking-wide text-[#7a5e4b]">OR</span>
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
          <div className="my-7 h-[1px]" />
          <GoogleLogin />
        </div>
      </div>

      <p className="mt-8 text-center text-[11px] font-medium text-[#7a5e4b]">
        By continuing, you agree to our <span className="text-[#a87442]">Terms of<br/>Service</span> & <span className="text-[#a87442]">Privacy Policy</span>.
      </p>
    </div>
  );
}

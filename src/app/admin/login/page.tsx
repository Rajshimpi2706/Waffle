'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Reuse our robust storefront logic wrapped in an admin shell
import { PhoneLogin } from '@/components/auth/PhoneLogin';
import { OTPVerify } from '@/components/auth/OTPVerify';
import { GoogleLogin } from '@/components/auth/GoogleLogin';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Suspense bounding for searchParams
function AdminAuthForms() {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const searchParams = useSearchParams();

  // Simple UI-side cooldown trap for abuse protection
  const [lockout, setLockout] = useState(false);

  // Unauthorized trap: If a normal user tries logging in here, the middleware bounces them back here.
  // We instantly destroy their session and tell them they aren't allowed.
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'unauthorized') {
      const ejectUnauthorizedUser = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.error('ACCESS DENIED', {
          description: 'This account does not have administrator privileges.',
          duration: 6000,
        });
        // Clear the URL parameter so it doesn't loop toast on refresh
        window.history.replaceState({}, '', '/admin/login');
      };
      ejectUnauthorizedUser();
    }
  }, [searchParams]);

  // Wrap the loading state to trap abuse
  const handleLoadingTrigger = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts > 5) {
        setLockout(true);
        setTimeout(() => {
          setLockout(false);
          setAttempts(0);
        }, 60000); // 1 minute lockout
      }
    }
  };

  if (lockout) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
        <h3 className="text-red-600 font-bold mb-2">Too Many Attempts</h3>
        <p className="text-red-500 text-sm font-medium">For security reasons, please wait 60 seconds before trying again.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className={`transition-all duration-500 absolute w-full ${step === 'PHONE' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 -z-10 -translate-x-8 pointer-events-none'}`}>
        <PhoneLogin 
          onSuccess={(p) => {
            setPhone(p);
            setStep('OTP');
          }}
          isLoading={isLoading}
          setIsLoading={handleLoadingTrigger}
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
            setIsLoading={handleLoadingTrigger}
          />
        )}
      </div>
      
      {/* Structural placeholder so absolute positioning works without collapsing */}
      <div className="invisible">
        <PhoneLogin onSuccess={() => {}} isLoading={false} setIsLoading={() => {}} />
        <div className="my-7 h-[1px]" />
        <GoogleLogin />
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-6 lg:p-12 selection:bg-[#C17839]/20 selection:text-[#3B1F0A]">
      <div className="max-w-md w-full animate-fade-in relative z-10">
        
        {/* Abstract Background Element Architecture */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#C17839]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#3B1F0A]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo/Branding Architecture */}
        <div className="text-center mb-10 relative">
           <Link href="/" className="inline-flex flex-col items-center gap-4 group mb-6">
              <div className="w-16 h-16 bg-[#3B1F0A] rounded-[1.5rem] flex items-center justify-center shadow-premium transform group-hover:rotate-[10deg] transition-all duration-700">
                 <span className="text-white font-serif font-black text-3xl">W</span>
              </div>
              <div>
                 <h1 className="text-3xl font-serif font-black tracking-tighter text-[#3B1F0A]">
                    Waffle<span className="text-[#C17839]">Wala</span>.
                 </h1>
                 <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] mt-1 opacity-60">Admin Protocol</p>
              </div>
           </Link>
           <h2 className="text-xl font-serif font-bold text-[#3B1F0A] tracking-tight">Business Gateway</h2>
           <p className="text-[#8B5E3C] mt-2 font-medium italic opacity-60 text-sm max-w-[260px] mx-auto leading-snug">Authorized access for executive personnel only.</p>
        </div>

        {/* Login Card Architecture */}
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-[#F5E6CC] shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C17839] to-[#3B1F0A] opacity-80" />
          
          <Suspense fallback={<div className="h-[200px] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#C17839] border-t-transparent rounded-full animate-spin" /></div>}>
            <AdminAuthForms />
          </Suspense>

        </div>

        {/* Footer Link Architecture */}
        <div className="text-center mt-10">
           <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A17C5F] hover:text-[#3B1F0A] transition-all group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Return to Public Storefront
           </Link>
        </div>

      </div>
    </div>
  );
}

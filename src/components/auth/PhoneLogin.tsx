'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, ChevronDown, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PhoneLoginProps {
  onSuccess: (phone: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function PhoneLogin({ onSuccess, isLoading, setIsLoading }: PhoneLoginProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: '+91' + cleanPhone,
      });

      if (otpError) {
        // Supabase rate limit or invalid config
        if (otpError.message.includes('rate_limit')) {
          throw new Error('Too many requests. Please try again in a few minutes.');
        }
        throw new Error(otpError.message || 'Failed to send OTP. Please try again.');
      }

      toast.success('OTP sent to your mobile number!');
      onSuccess(cleanPhone);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in w-full">
      <div className="space-y-2">
        <label className="text-[13px] font-bold text-[#2a1306] ml-1">
          Mobile Number
        </label>
        <div className="relative group">
          {/* Flag and country code prefix */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 bg-white border-r border-[#ece0d1] z-10 rounded-l-[12px] h-[calc(100%-8px)] text-[#2a1306]">
            <img src="https://flagcdn.com/w20/in.png" srcSet="https://flagcdn.com/w40/in.png 2x" width="20" alt="India flag" className="rounded-sm" />
            <span className="font-bold text-[15px] ml-0.5">+91</span>
            <ChevronDown size={14} className="text-[#a1897b] ml-0.5" />
          </div>
          <Input 
            type="tel"
            placeholder="Enter 10-digit number"
            className="pl-[104px] h-[58px] bg-white border border-[#4a2e1b] rounded-xl shadow-sm focus:ring-4 focus:ring-[#4a2e1b]/5 transition-all text-[#2a1306] font-medium text-[16px] w-full placeholder:text-[#a1897b]"
            value={phone}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(val);
              if (error) setError('');
            }}
            disabled={isLoading}
            maxLength={10}
            autoFocus
          />
        </div>
        {error && <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">{error}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full h-[58px] rounded-full shadow-[0_10px_20px_-5px_rgba(69,38,20,0.4)] bg-gradient-to-r from-[#d39665] via-[#a86532] to-[#2a1306] hover:scale-[1.02] text-white border-none group transition-all active:scale-[0.98] mt-2"
        disabled={phone.length < 10 || isLoading}
      >
        {isLoading ? (
          <Loader2 size={24} className="animate-spin text-white/70" />
        ) : (
          <div className="flex items-center gap-2 font-medium text-[17px]">
            Send OTP
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-90 group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        )}
      </Button>
    </form>
  );
}

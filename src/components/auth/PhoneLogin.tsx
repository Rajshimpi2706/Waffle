'use client';

import { useState } from 'react';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1">
          Mobile Number
        </label>
        <div className="relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Phone size={18} className="text-[#C17839] group-focus-within:scale-110 transition-transform" />
            <span className="text-[#3B1F0A] font-bold text-sm border-r border-[#F5E6CC] pr-2">+91</span>
          </div>
          <Input 
            type="tel"
            placeholder="Enter 10-digit number"
            className="pl-24 h-16 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-2xl focus:shadow-premium transition-all text-[#3B1F0A] font-bold text-lg tracking-wide placeholder:tracking-normal placeholder:font-medium"
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
        {error && <p className="text-[10px] text-red-500 mt-1 ml-1 font-black uppercase tracking-widest animate-fade-in">{error}</p>}
      </div>

      <Button 
        type="submit" 
        size="xl"
        className="w-full h-16 rounded-[1.5rem] shadow-premium hover:shadow-[#C17839]/20 bg-[#C17839] hover:bg-[#3B1F0A] text-white border-none group transition-all active:scale-95 text-lg font-black"
        loading={isLoading}
        disabled={phone.length < 10 || isLoading}
      >
        {isLoading ? (
          'Sending...'
        ) : (
          <>
            Send OTP
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, RefreshCcw, ShieldCheck, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

interface OTPVerifyProps {
  phone: string;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function OTPVerify({ phone, onBack, isLoading, setIsLoading }: OTPVerifyProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // take only last char
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
    if (value && index === 5 && newOtp.every(val => val !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    // Focus next empty or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
       handleVerify(pastedData);
    }
  };

  const resendOTP = async () => {
    if (timer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        phone: '+91' + phone,
      });
      if (error) throw error;
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('New OTP sent successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const syncCustomerProfile = async (userId: string, phoneString: string) => {
    try {
      const supabase = createClient();
      
      // Check if customer exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (!existing) {
        // Create new customer profile
        await supabase.from('customers').insert({
          auth_user_id: userId,
          phone: phoneString,
          created_at: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Customer sync error:', e);
      // Non-blocking error
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: '+91' + phone,
        token: code,
        type: 'sms',
      });

      if (verifyError) throw verifyError;
      if (!data.user) throw new Error('Verification failed');

      // Sync User Identity
      await syncCustomerProfile(data.user.id, phone);

      toast.success('Verified successfully!');
      
      // Determine Redirect (Default to / if none provided)
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      router.refresh();

    } catch (err: any) {
      const isExpired = err.message.toLowerCase().includes('expired');
      setError(isExpired ? 'OTP has expired. Please request a new one.' : 'Invalid code. Please check and try again.');
      toast.error('Verification Failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-4 bg-[#FDF6EC]/50 border border-[#F5E6CC] rounded-2xl mb-6">
        <div>
          <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest break-all">Sent to</p>
          <p className="text-[#3B1F0A] font-bold">+91 {phone.slice(0, 5)} {phone.slice(5)}</p>
        </div>
        <button 
          onClick={onBack}
          disabled={isLoading}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-soft text-[#C17839] hover:bg-[#C17839] hover:text-white transition-colors"
        >
          <Edit2 size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-[#22C55E]" />
          Enter Security Code
        </label>
        
        <div 
          className="flex justify-between gap-2 sm:gap-4"
          onPaste={handlePaste}
        >
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={isLoading}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black rounded-2xl border bg-[#FDF6EC]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#C17839]/50 ${
                error 
                  ? 'border-red-300 text-red-500 bg-red-50' 
                  : digit 
                    ? 'border-[#C17839] text-[#3B1F0A] shadow-soft' 
                    : 'border-[#F5E6CC] text-[#3B1F0A]'
              }`}
            />
          ))}
        </div>
        {error && <p className="text-[10px] text-red-500 text-center font-black uppercase tracking-widest animate-fade-in">{error}</p>}
      </div>

      <Button 
        onClick={() => handleVerify(otp.join(''))}
        className="w-full h-[52px] rounded-full shadow-[0_4px_14px_rgba(42,19,6,0.3)] bg-[#2a1306] hover:bg-[#1a0a03] text-white border-none group transition-all active:scale-[0.98] mt-4 font-normal text-[15px]"
        loading={isLoading}
        disabled={otp.join('').length < 6 || isLoading}
      >
        Secure Verify
      </Button>

      <div className="text-center pt-4">
        <button
          onClick={resendOTP}
          disabled={timer > 0 || isLoading}
          className={`text-sm font-bold tracking-wide flex items-center justify-center gap-2 mx-auto transition-colors ${
            timer > 0 ? 'text-[#A17C5F] opacity-60 cursor-not-allowed' : 'text-[#C17839] hover:text-[#3B1F0A]'
          }`}
        >
          <RefreshCcw size={16} className={timer === 0 && !isLoading ? 'animate-bounce-subtle' : ''}/>
          {timer > 0 ? `Resend Code in ${timer}s` : 'Resend Code Now'}
        </button>
      </div>
    </div>
  );
}

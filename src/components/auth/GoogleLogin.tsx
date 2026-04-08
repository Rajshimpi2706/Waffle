'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function GoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const redirectPath = searchParams.get('redirect') || '/';
      
      // Construct the absolute callback URL
      // We use window.location.origin to ensure it works on localhost:3001 in dev
      // and your production domain in prod.
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize Google Login');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="w-full h-[52px] flex items-center justify-center gap-3 bg-[#2a1306] rounded-full shadow-[0_4px_14px_rgba(42,19,6,0.3)] hover:bg-[#1a0a03] transition-all active:scale-[0.98] mt-2 group"
    >
      {isLoading ? (
        <Loader2 size={20} className="animate-spin text-white/70" />
      ) : (
        <>
          <div className="bg-white p-1 rounded-full w-7 h-7 flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <span className="font-semibold text-white/95 text-[15px]">Continue with Google</span>
        </>
      )}
    </button>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify if they are an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('auth_user_id', data.user.id)
        .single();

      if (adminError || !adminUser) {
        // Sign out if they aren't an admin
        await supabase.auth.signOut();
        throw new Error('Access denied. No administrative record found for this account.');
      }

      toast.success('Access granted. Welcome back!');
      router.push(returnTo);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-6 lg:p-12 selection:bg-[#C17839]/20 selection:text-[#3B1F0A]">
      <div className="max-w-md w-full animate-fade-in relative">
        
        {/* Abstract Background Element Architecture */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#C17839]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#3B1F0A]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo/Branding Architecture */}
        <div className="text-center mb-12 relative">
           <Link href="/" className="inline-flex flex-col items-center gap-4 group mb-8">
              <div className="w-20 h-20 bg-[#3B1F0A] rounded-[2rem] flex items-center justify-center shadow-premium transform group-hover:rotate-[10deg] transition-all duration-700">
                 <span className="text-white font-serif font-black text-4xl">W</span>
              </div>
              <div>
                 <h1 className="text-4xl font-serif font-black tracking-tighter text-[#3B1F0A]">
                    Waffle<span className="text-[#C17839]">Wala</span>.
                 </h1>
                 <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] mt-2 opacity-60">Admin Protocol</p>
              </div>
           </Link>
           <h2 className="text-2xl font-serif font-black text-[#3B1F0A] tracking-tight">Business Gateway</h2>
           <p className="text-[#8B5E3C] mt-2 font-medium italic opacity-60 text-sm">Authorized access for executive personnel only.</p>
        </div>

        {/* Login Card Architecture */}
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-12 border border-[#F5E6CC] shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#C17839] to-[#3B1F0A] opacity-80" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2.5">
               <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest ml-1">Secure Email</label>
               <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within/input:scale-110 transition-transform" size={18} />
                  <Input 
                    type="email" 
                    placeholder="personnel@wafflewala.com"
                    className="pl-12 h-14 rounded-2xl bg-[#FDF6EC]/30 border-[#F5E6CC] focus:bg-white focus:shadow-premium transition-all font-bold text-[#3B1F0A]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
               </div>
            </div>

            <div className="space-y-2.5">
               <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Access Key</label>
                  <Link href="/admin/login/forgot-password" className="text-[10px] font-black text-[#C17839] uppercase tracking-widest hover:text-[#3B1F0A] transition-colors">Forgot Key?</Link>
               </div>
               <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within/input:scale-110 transition-transform" size={18} />
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-12 h-14 rounded-2xl bg-[#FDF6EC]/30 border-[#F5E6CC] focus:bg-white focus:shadow-premium transition-all font-bold text-[#3B1F0A]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
               </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#3B1F0A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#3B1F0A]/20 transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                 <>
                   Validate & Enter <ArrowLeft className="rotate-180" size={14} />
                 </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link Architecture */}
        <div className="text-center mt-12">
           <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A17C5F] hover:text-[#3B1F0A] transition-all group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Return to Public Storefront
           </Link>
        </div>

      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        
        {/* Logo/Branding */}
        <div className="text-center mb-8">
           <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 bg-[#C17839] rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">W</div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Waffle Wala <span className="text-[#C17839]">Admin</span></span>
           </Link>
           <h1 className="text-2xl font-bold text-gray-900">Business Management</h1>
           <p className="text-gray-500 mt-2">Secure access for store owners and managers.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
               <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Email Address</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    type="email" 
                    placeholder="admin@wafflewala.com"
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
               </div>
            </div>

            <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Password</label>
                  <Link href="/admin/login/forgot-password" className="text-xs text-[#C17839] hover:underline" style={{ fontSize: '0.75rem' }}>Forgot password?</Link>
               </div>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
               </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#C17839] hover:bg-[#A6662E] text-white font-bold shadow-lg shadow-[#C17839]/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enter Dashboard'}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-8">
           <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-2 transition-colors">
              <ArrowLeft size={14} /> Back to Website
           </Link>
        </div>

      </div>
    </div>
  );
}

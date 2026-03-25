'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema } from '@/lib/validations';
import type { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/cart';

type FormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') {
      toast.error('Your session has expired. Please log in again.');
    } else if (reason === 'unauthorized') {
      toast.error('You must be logged in to view that page.');
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // 1. Authenticate via Supabase Auth
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // 2. Fetch Customer Record
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        throw customerError; // ignore not found, might be a brand new user or admin
      }

      // 3. Merge Carts
      if (customer) {
        // Fetch cart from DB if we implemented db sync, else just merge guest cart here
        // For now, guest cart merge assumes all current Zustand cart items should be merged.
        // The persist layer will save it to localStorage under their new logged-in state.
        const currentItems = useCartStore.getState().items;
        if (currentItems.length > 0) {
          mergeGuestCart(currentItems);
          toast.success('Cart synced successfully');
        }
      }

      toast.success('Successfully logged in');
      
      const redirectPath = searchParams.get('redirect') || '/';
      router.push(redirectPath);
      router.refresh(); // Refresh server components to get new auth state

    } catch (err: any) {
       toast.error(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#3B1F0A] mb-1">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          error={!!errors.email}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-[#3B1F0A]">Password</label>
          <button type="button" className="text-sm font-medium text-[#C17839] hover:underline">
            Forgot password?
          </button>
        </div>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={!!errors.password}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-6" size="lg" loading={loading}>
        Log In
      </Button>
    </form>
  );
}

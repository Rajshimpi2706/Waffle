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

type FormData = z.infer<typeof loginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') {
      toast.error('Session expired. Please log in again.');
    } else if (reason === 'unauthorized') {
      toast.error('Unauthorized access. Admin privileges required.');
    }
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Verify Admin Role immediately
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (adminError || !adminUser || !adminUser.is_active) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized. Account is not registered as an active admin.');
      }

      toast.success(`Welcome back, ${adminUser.role}`);
      router.push('/admin');
      router.refresh();

    } catch (err: any) {
       toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
        <Input
          type="email"
          placeholder="admin@wafflehouse.in"
          className="border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-gray-900"
          {...register('email')}
          error={!!errors.email}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Master Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          className="border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-gray-900"
          {...register('password')}
          error={!!errors.password}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <Button 
        type="submit" 
        className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-6" 
        size="lg" 
        loading={loading}
      >
        Access Dashboard
      </Button>
    </form>
  );
}

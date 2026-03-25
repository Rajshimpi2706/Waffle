'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { signupSchema } from '@/lib/validations';
import type { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

type FormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Attempt sign up. Supabase will send a confirmation email or auto-confirm based on project settings.
      // We also insert the record into the 'customers' table using the triggers or via API.
      // Easiest is to sign up, wait for response, then insert into customers manually or use a postgres function.
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            phone: data.phone,
          },
        },
      });

      if (error) throw error;
      
      if (authData.user) {
         // Insert into customers manually here if triggers are not set up
         const { error: customerError } = await supabase
           .from('customers')
           .insert({
             auth_user_id: authData.user.id,
             full_name: data.full_name,
             email: data.email,
             phone: data.phone,
             is_guest: false,
           });
           
         if (customerError) {
             console.error("Warning: Failed to create customer record", customerError.message);
         }
      }

      toast.success('Account created successfully');
      router.push('/');
      router.refresh();

    } catch (err: any) {
       toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#3B1F0A] mb-1">Full Name</label>
        <Input
          placeholder="John Doe"
          {...register('full_name')}
          error={!!errors.full_name}
        />
        {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
           <label className="block text-sm font-medium text-[#3B1F0A] mb-1">Phone</label>
           <Input
             type="tel"
             placeholder="9876543210"
             {...register('phone')}
             error={!!errors.phone}
           />
           {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#3B1F0A] mb-1">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={!!errors.password}
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full mt-6" size="lg" loading={loading}>
        Create Account
      </Button>
    </form>
  );
}

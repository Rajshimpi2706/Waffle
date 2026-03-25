import { Suspense } from 'react';
import { CheckoutClient } from './CheckoutClient';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Checkout | Waffle House',
  description: 'Complete your order securely.',
};

export default async function CheckoutPage() {
  const supabase = await createClient();

  // Fetch the default branch (usually the only branch for a simple store)
  // We need its tax percentage and prices_include_tax flags
  const { data: branch } = await supabase
    .from('branches')
    .select('id, tax_percentage, prices_include_tax')
    .limit(1)
    .single();

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3B1F0A] mb-8 animate-fade-in">
          Checkout
        </h1>
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading checkout...</div>}>
          <CheckoutClient branch={branch} />
        </Suspense>
      </div>
    </div>
  );
}

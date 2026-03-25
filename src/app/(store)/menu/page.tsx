import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { MenuClient } from './MenuClient';

export const metadata = {
  title: 'Our Menu | Waffle House',
  description: 'Explore our wide range of Classic, Chocolate, and Premium Belgian Waffles.',
};

export const revalidate = 60; // Revalidate every minute

export default async function MenuPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return (
      <div className="bg-[#FDF6EC] min-h-screen py-12 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-[#E5D5C0] shadow-sm max-w-md">
          <h2 className="text-xl font-serif font-bold text-[#3B1F0A] mb-2">Supabase Not Configured</h2>
          <p className="text-[#8B5E3C] text-sm">
            Please set your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to view the menu.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // Fetch all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (catError) {
    console.error('Error fetching categories:', catError.message || catError);
  }

  // Fetch all available products with variants and toppings
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*),
      toppings:product_toppings(toppings:toppings_addons(*))
    `)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (prodError) {
    console.error('Error fetching products:', prodError.message || prodError);
  }

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-4">Our Menu</h1>
          <p className="text-[#8B5E3C] text-lg">
            Freshly baked, 100% vegetarian Belgian waffles made to order. Explore our signature creations.
          </p>
        </div>

        <Suspense fallback={<div className="h-96 flex items-center justify-center text-[#8B5E3C]">Loading menu...</div>}>
          <MenuClient 
            initialCategories={categories || []} 
            initialProducts={products || []} 
          />
        </Suspense>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { MenuClient } from './MenuClient';
import { createServiceClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Our Delicious Menu | Waffle Wala',
  description: 'Explore our premium range of Classic, Chocolate, and Premium Belgian Waffles. Har Bite Mein Happiness!',
};

// Ensure page is always dynamic to fetch latest from DB
export const dynamic = 'force-dynamic';

import { PRODUCTS } from '@/data/products';

async function getMenuData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Detect placeholder values
  const isPlaceholder = !supabaseUrl || !supabaseKey || 
                        supabaseUrl.includes('your-project') || 
                        supabaseKey.includes('your-role-key');

  if (isPlaceholder) {
    console.warn('[Waffle Wala] Using Phase 1 static fallback data (Supabase credentials not configured in .env.local)');
    return PRODUCTS;
  }

  try {
    const supabase = await createServiceClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_available', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error(`[Supabase Error] Falling back to static data. Message: ${error.message}`);
      return PRODUCTS;
    }

    // Explicitly cast price to Number because Postgres Numeric can be returned as string
    return (products || []).map(p => ({
      ...p,
      price: Number(p.price) || 0
    }));
  } catch (err) {
    console.error('Unhandled error in getMenuData, falling back to static data:', err);
    return PRODUCTS;
  }
}

export default async function MenuPage() {
  // Fetch products (Directly from Supabase on the server)
  const products = await getMenuData();

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in shadow-sm p-8 bg-white rounded-3xl border border-[#F5E6CC]">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-4 italic">Our Delicious Menu</h1>
          <div className="w-16 h-1 bg-[#C17839] mx-auto rounded-full mb-4" />
          <p className="text-[#8B5E3C] text-lg font-medium">
            "Har Bite Mein Happiness"
          </p>
          <p className="text-[#8B5E3C]/80 mt-2 text-sm">
            Freshly baked, 100% vegetarian Belgian waffles made with love and premium chocolate.
          </p>
        </div>

        <Suspense fallback={<div className="h-96 flex flex-col items-center justify-center text-[#8B5E3C]">
          <div className="w-12 h-12 border-4 border-[#C17839] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-medium">Baking your waffles...</p>
        </div>}>
          <MenuClient 
            initialCategories={[]} 
            initialProducts={products} 
          />
        </Suspense>
      </div>
    </div>
  );
}

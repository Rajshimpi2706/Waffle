import { Suspense } from 'react';
import { Star, ShoppingBag } from 'lucide-react';
import { MenuClient } from './MenuClient';
import { createServiceClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Our Delicious Menu | Waffle Wala',
  description: 'Explore our premium range of Classic, Chocolate, and Premium Waffles. Har Bite Mein Happiness!',
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
    <div className="bg-[#FDF6EC] min-h-screen py-20 translate-y-[-1px]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in py-12 px-8 bg-white rounded-[3rem] shadow-soft border border-[#F5E6CC] relative overflow-hidden">
          {/* Subtle Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#C17839] to-transparent opacity-30" />
          
          <h1 className="text-5xl md:text-6xl font-serif font-black text-[#3B1F0A] mb-6 tracking-tighter">
            Our <span className="text-[#C17839]">Signature</span> Menu
          </h1>
          
          <div className="flex items-center justify-center gap-3 mb-8 opacity-20">
             <div className="h-[1px] w-12 bg-[#8B5E3C]" />
             <Star size={12} className="fill-[#8B5E3C]" />
             <div className="h-[1px] w-12 bg-[#8B5E3C]" />
          </div>

          <p className="text-xl text-[#8B5E3C] font-medium italic mb-4">
            "Every bite is a promise of happiness."
          </p>
          <p className="text-[#8B5E3C]/60 max-w-xl mx-auto text-sm font-bold uppercase tracking-widest leading-relaxed">
            Authentic Premium Recipe • 100% Vegetarian • Premium Dark Chocolate
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

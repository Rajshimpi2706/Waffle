import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductsClient } from './ProductsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Products Management | Waffle House Admin',
};

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminUser || !['owner', 'manager'].includes(adminUser.role)) {
    redirect('/admin?reason=unauthorized-products');
  }

  // Pre-fetch products and categories
  const [productsRes, categoriesRes, toppingsRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true }),
    supabase
      .from('toppings_addons')
      .select('*')
      .order('name', { ascending: true })
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Products & Inventory</h1>
          <p className="text-gray-500">Manage your menu offerings, prices, and stock levels.</p>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-white rounded-2xl">Loading products...</div>}>
         <ProductsClient 
            initialProducts={productsRes.data || []} 
            categories={categoriesRes.data || []}
            toppings={toppingsRes.data || []}
            adminRole={adminUser.role} 
         />
      </Suspense>
    </div>
  );
}

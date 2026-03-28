import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { ProductsClient } from './ProductsClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Menu Management | Waffle Wala Admin',
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

  // Fetch products with category names
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name)
    `)
    .order('sort_order', { ascending: true });

  // Fetch categories for the Add/Edit form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="max-w-7xl mx-auto text-gray-900">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or remove products from your digital menu.</p>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-white rounded-2xl border border-gray-100">Loading menu inventory...</div>}>
         <ProductsClient 
           initialProducts={products || []} 
           categories={categories || []}
           adminRole={adminUser.role} 
         />
      </Suspense>
    </div>
  );
}

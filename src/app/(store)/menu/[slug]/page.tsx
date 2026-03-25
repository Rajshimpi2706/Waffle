import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductClient } from './ProductClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('slug', slug)
    .single();

  if (!product) return { title: 'Not Found | Waffle House' };

  return {
    title: `${product.name} | Waffle House`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Waffle House`,
      description: product.description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(id, name, slug),
      variants:product_variants(*),
      product_toppings(
        is_default,
        toppings:toppings_addons(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !product) {
    notFound();
  }

  // Format toppings data to match the expected client type shape
  const formattedProduct = {
    ...product,
    toppings: product.product_toppings?.map((pt: any) => ({
      ...pt.toppings,
      is_default: pt.is_default,
    })) || [],
  };

  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        <ProductClient product={formattedProduct} />
      </div>
    </div>
  );
}

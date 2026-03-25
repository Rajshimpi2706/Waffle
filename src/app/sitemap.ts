import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wafflehouse.in';
  
  // Static Routes
  const staticRoutes = [
    '',
    '/menu',
    '/login',
    '/signup',
    '/track-order',
    '/privacy-policy',
    '/terms',
    '/refund-policy'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Product Routes
  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_available', true);

    const productRoutes = (products || []).map((product) => ({
      url: `${baseUrl}/menu/${product.slug}`,
      lastModified: new Date(product.updated_at || new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch (error) {
    return staticRoutes;
  }
}

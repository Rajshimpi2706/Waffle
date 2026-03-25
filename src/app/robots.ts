import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wafflehouse.in';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/checkout/',
        '/api/',
        '/order/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

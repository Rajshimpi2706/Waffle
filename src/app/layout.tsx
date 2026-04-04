import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ReactToastProvider } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Waffle House | Premium Desserts & Waffles',
  description: 'Handcrafted Premium waffles baked to perfection. Order online for takeaway or delivery.',
  keywords: ['waffles', 'dessert', 'chocolate', 'takeaway', 'delivery'],
  openGraph: {
    title: 'Waffle Wala - Har Bite Mein Happiness',
    description: 'Handcrafted Premium waffles baked to perfection.',
    images: ['/images/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Waffle Wala - Har Bite Mein Happiness',
    description: 'Handcrafted Premium waffles baked to perfection.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn('h-full scroll-smooth', inter.variable, playfair.variable)}>
      <body className="min-h-full flex flex-col font-sans antialiased text-[#3B1F0A] bg-[#FDF6EC]">
        {children}
        <ReactToastProvider />
      </body>
    </html>
  );
}

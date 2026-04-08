import { Suspense } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDF6EC]">
      <Suspense fallback={<div className="h-16 w-full bg-[#FDF6EC]/80 backdrop-blur-xl animate-pulse" />}>
        <Navbar />
      </Suspense>
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}

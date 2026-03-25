import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { CartDrawer } from '@/components/ui/CartDrawer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDF6EC]">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <CartDrawer />
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

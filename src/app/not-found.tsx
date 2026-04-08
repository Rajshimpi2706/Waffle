import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-soft border border-[#F5E6CC] rotate-3">
        <ShoppingBag size={48} className="text-[#F5E6CC]" />
      </div>
      
      <h1 className="text-5xl font-serif font-black text-[#3B1F0A] mb-6 tracking-tighter">
        404 - Page <span className="text-[#C17839]">Not Found</span>
      </h1>
      
      <p className="text-[#8B5E3C] max-w-md mb-10 font-medium italic text-lg leading-relaxed">
        "We couldn't find the waffle you're looking for. Let's get you back to the main menu!"
      </p>

      <Link href="/">
        <Button
          size="xl"
          className="rounded-full px-10 bg-[#3B1F0A] text-white flex items-center gap-3 shadow-lg hover:scale-105 transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
          Return to Home
        </Button>
      </Link>
    </div>
  );
}

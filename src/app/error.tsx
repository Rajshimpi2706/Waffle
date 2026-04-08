'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-8">
        <AlertCircle size={40} />
      </div>
      <h1 className="text-4xl font-serif font-black text-[#3B1F0A] mb-4">Navigation Error</h1>
      <p className="text-[#8B5E3C] max-w-md mb-10 font-medium italic">
        "We're having a little trouble loading this page. Please try again."
      </p>
      <div className="bg-white p-4 rounded-xl border border-red-200 mb-10 text-left max-w-lg overflow-auto">
        <p className="text-xs font-mono text-red-600">{error.message || 'Unknown hydration or runtime error.'}</p>
      </div>
      <Button onClick={() => reset()} size="xl" className="rounded-full px-10 bg-[#3B1F0A] text-white flex items-center gap-2">
        <RefreshCcw size={20} /> Try Again
      </Button>
    </div>
  );
}

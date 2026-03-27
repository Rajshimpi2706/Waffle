'use client';

import { useRouter } from 'next/navigation';
import { XCircle, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PaymentFailedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-4 py-12 lg:py-20 animate-fade-in">
      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] shadow-sm border border-gray-100 text-center max-w-lg w-full">
        
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <XCircle className="text-red-500" size={40} />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4">Payment Unsuccessful</h1>
        <p className="text-gray-500 text-lg mb-10">
          We couldn't process your payment. This could be due to a network issue, insufficient funds, or the transaction was cancelled.
        </p>

        <div className="bg-red-50/50 rounded-2xl p-6 text-left border border-red-100 mb-10">
          <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-2">What happened?</h3>
          <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
            <li>Insufficient balance in your account</li>
            <li>Incorrect card or UPI details provided</li>
            <li>Bank server was temporarily unavailable</li>
            <li>Transaction was cancelled by the user</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.push('/checkout')} 
            variant="primary" 
            className="h-14 px-8 rounded-2xl shadow-lg hover:shadow-xl group"
            size="lg"
          >
            <RefreshCw size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </Button>
          <Button 
            onClick={() => router.push('/menu')} 
            variant="secondary" 
            className="h-14 px-8 rounded-2xl"
            size="lg"
          >
            <ShoppingBag size={20} className="mr-2" />
            Go to Menu
          </Button>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-8 text-sm font-bold text-gray-400 hover:text-[#C17839] transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

      </div>
    </div>
  );
}

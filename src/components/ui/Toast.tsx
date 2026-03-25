'use client';

import { Toaster as Sonner } from 'sonner';

export function ReactToastProvider() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: 'group bg-white border border-[#E5D5C0] text-[#3B1F0A] shadow-lg rounded-xl font-sans',
          title: 'font-semibold',
          description: 'text-[#8B5E3C]',
          actionButton: 'bg-[#C17839] text-white py-1 px-3 rounded-lg hover:bg-[#A8662D] transition-colors',
          cancelButton: 'bg-[#FDF6EC] text-[#3B1F0A] py-1 px-3 rounded-lg hover:bg-[#F5E6CC] transition-colors border-none',
          error: 'border-red-500 bg-red-50 text-red-900',
          success: 'border-green-500 bg-green-50 text-green-900',
          warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
          info: 'border-blue-500 bg-blue-50 text-blue-900',
        },
      }}
    />
  );
}

// Re-export toast for convenience
export { toast } from 'sonner';

import { Suspense } from 'react';
import { AdminLoginForm } from './AdminLoginForm';

export const metadata = {
  title: 'Admin Login | Waffle House',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <span className="font-serif text-3xl font-bold tracking-tight text-[#3B1F0A] inline-block mb-2">
            Waffle<span className="text-[#C17839]">Admin</span>.
          </span>
          <p className="text-gray-500 text-sm">Secure Portal Access</p>
        </div>

        <Suspense fallback={<div className="h-48 flex items-center justify-center">Loading...</div>}>
          <AdminLoginForm />
        </Suspense>

        <div className="mt-8 text-center">
           <a href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
             &larr; Back to Storefront
           </a>
        </div>
      </div>
    </div>
  );
}

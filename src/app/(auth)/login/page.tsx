import { Suspense } from 'react';
import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Log In | Waffle House',
  description: 'Log in to your Waffle House account to access your orders and saved addresses.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDF6EC]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-[#E5D5C0]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#3B1F0A]">
              Waffle<span className="text-[#C17839]">House</span>.
            </span>
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-[#3B1F0A] mb-2">Welcome Back</h1>
          <p className="text-[#8B5E3C]">Enter your essential details to log in.</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-center text-sm text-[#8B5E3C]">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-[#C17839] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

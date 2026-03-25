import { Suspense } from 'react';
import Link from 'next/link';
import { SignupForm } from './SignupForm';

export const metadata = {
  title: 'Sign Up | Waffle House',
  description: 'Create an account to join Waffle House.',
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDF6EC]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-[#E5D5C0]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-serif text-3xl font-bold tracking-tight text-[#3B1F0A]">
              Waffle<span className="text-[#C17839]">House</span>.
            </span>
          </Link>
          <h1 className="text-2xl font-serif font-semibold text-[#3B1F0A] mb-2">Create an Account</h1>
          <p className="text-[#8B5E3C]">Join us for delicious rewards and faster checkout.</p>
        </div>

        <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading form...</div>}>
          <SignupForm />
        </Suspense>

        <p className="mt-8 text-center text-sm text-[#8B5E3C]">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-[#C17839] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

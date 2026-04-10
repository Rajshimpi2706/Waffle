'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminSetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  const checkLogin = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      setStatus('error');
      setMessage('You are not logged in. Please log in at /login first, then come back here.');
    }
  };

  useState(() => {
    checkLogin();
  });

  const registerAsAdmin = async () => {
    setStatus('loading');
    setMessage('Registering you as admin...');

    try {
      const res = await fetch('/api/admin/setup', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(data.error || 'Unknown error occurred.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('Network error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-[2rem] border border-[#F5E6CC] shadow-xl p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#3B1F0A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif font-black text-3xl">W</span>
          </div>
          <h1 className="text-2xl font-serif font-black text-[#3B1F0A]">Admin Setup</h1>
          <p className="text-[#8B5E3C] text-sm mt-2 opacity-70">One-time admin registration</p>
        </div>

        {/* Current User */}
        <div className="bg-[#FDF6EC] rounded-xl p-4 mb-6 border border-[#F5E6CC]">
          <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1">Logged in as:</p>
          {user ? (
            <p className="font-bold text-[#3B1F0A] text-sm">{user.email || user.phone || 'Unknown'}</p>
          ) : (
            <p className="text-red-500 text-sm font-bold">Not logged in</p>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-8 text-sm text-[#8B5E3C]">
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-[#3B1F0A] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
            <p>First, make sure you are logged in. If not, go to <Link href="/login" className="text-[#C17839] font-bold underline">/login</Link> and sign in.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-[#3B1F0A] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
            <p>Click the button below to register yourself as <strong>Owner</strong> (full admin access).</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 bg-[#3B1F0A] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
            <p>After success, go to <Link href="/admin" className="text-[#C17839] font-bold underline">/admin</Link> to access your dashboard.</p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-xl p-4 mb-6 text-sm font-medium border ${
            status === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            status === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {status !== 'success' && (
            <button
              onClick={registerAsAdmin}
              disabled={status === 'loading' || !user}
              className="w-full h-14 bg-[#3B1F0A] text-white rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-[#2a1306] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Registering...' : '🚀 Register Me as Admin Owner'}
            </button>
          )}

          {status === 'success' && (
            <Link
              href="/admin"
              className="block w-full h-14 bg-green-600 text-white rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-green-700 transition-all text-center leading-[3.5rem]"
            >
              ✅ Go to Admin Dashboard →
            </Link>
          )}

          <Link
            href="/login"
            className="block w-full h-12 border border-[#F5E6CC] text-[#8B5E3C] rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FDF6EC] transition-all text-center leading-[3rem]"
          >
            Go to Login Page
          </Link>
        </div>

      </div>
    </div>
  );
}

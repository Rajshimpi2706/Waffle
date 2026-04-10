'use client';

import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

// Use globalThis to survive Next.js HMR (hot module replacement) reloads.
// Without this, every hot reload creates a new instance while the old one
// still holds the auth storage lock → "Lock broken by steal" AbortError.
declare global {
  var __supabase_client: SupabaseClient | undefined;
}

export function createClient(): SupabaseClient {
  if (globalThis.__supabase_client) {
    return globalThis.__supabase_client;
  }

  globalThis.__supabase_client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Persist session in localStorage (default) — single lock owner
        persistSession: true,
        // Detect session from URL hash on OAuth callback
        detectSessionInUrl: true,
        // Auto-refresh the token before it expires
        autoRefreshToken: true,
      },
    }
  );

  return globalThis.__supabase_client;
}

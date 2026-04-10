'use client';

import { useEffect } from 'react';

/**
 * Suppresses the "Lock broken by steal" AbortError that Supabase Auth
 * emits during concurrent tab / HMR hot-reload scenarios. This is a
 * cosmetic browser console error — it does NOT indicate data loss or
 * a real failure.
 *
 * Root cause: Supabase uses the Web Locks API to serialize token
 * refreshes. When a new page loads (or HMR fires) the new lock request
 * uses the `steal` option to take over, which causes the previous
 * promise to reject with AbortError.
 */
export function SupabaseLockErrorSuppressor() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || '';
      if (
        msg.includes('Lock broken') ||
        msg.includes('steal') ||
        msg.includes('AbortError')
      ) {
        // Prevent this known-harmless error from showing as unhandled
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return null;
}

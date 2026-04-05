/**
 * Environment variable sanity check.
 * Import this in server-side API routes to catch misconfiguration early.
 *
 * Usage:
 *   import { assertServerEnv } from '@/lib/env';
 *   assertServerEnv(); // throws with a clear message if any required var is missing
 */

const REQUIRED_SERVER_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
] as const;

const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
] as const;

/**
 * Call from server-side API routes or `getServerSideProps` to validate
 * that all required environment variables are present.
 * Logs a clear error and throws so the API returns 500 instead of a silent
 * misconfiguration.
 */
export function assertServerEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    const val = process.env[key];
    if (!val || val.includes('your-') || val.includes('YOUR_')) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const msg = `[ENV] Missing or placeholder env vars: ${missing.join(', ')}. Check your .env.local or Vercel environment settings.`;
    console.error(msg);
    throw new Error(msg);
  }
}

/**
 * Lightweight check used in client-side contexts (does NOT throw).
 * Returns true if the key public vars look configured.
 */
export function isEnvConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url && key &&
    !url.includes('your-project') &&
    !key.includes('your-role-key')
  );
}

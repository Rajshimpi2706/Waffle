import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/setup
 * One-time admin registration. Registers the currently logged-in user as 'owner'.
 * IMPORTANT: Remove this file once you've set up your admin account.
 */
export async function POST() {
  const supabase = await createClient();

  // 1. Get the currently authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be logged in first. Visit /login, sign in with Google or phone, then come back here.' }, { status: 401 });
  }

  // 2. Check if already registered as admin
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single();

  if (existing) {
    return NextResponse.json({ 
      success: true, 
      message: `You are already registered as admin with role: ${existing.role}. Go to /admin to access the panel.`,
      alreadyExists: true 
    });
  }

  // 3. Register user as owner
  const { error: insertError } = await supabase
    .from('admin_users')
    .insert({
      auth_user_id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
      role: 'owner',
      created_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error('Admin setup error:', insertError);
    return NextResponse.json({ 
      error: `Database error: ${insertError.message}. Make sure the admin_users table exists in Supabase.`,
      details: insertError 
    }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: `✅ Success! ${user.email} is now registered as OWNER. Go to /admin to access the panel.`,
    user: { id: user.id, email: user.email, role: 'owner' }
  });
}

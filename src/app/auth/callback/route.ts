import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      // Sync User Identity
      // Since Google OAuth might not have a phone number initially, we use email or ID
      const authUser = data.user;
      
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();
        
      if (!existing) {
        await supabase.from('customers').insert({
          auth_user_id: authUser.id,
          phone: authUser.phone || null,
          created_at: new Date().toISOString()
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

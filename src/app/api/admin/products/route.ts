import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, adminUser: null };

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single();

  return { user, adminUser };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { adminUser } = await checkAdmin(supabase);

    if (!adminUser || !['owner', 'manager'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Create new product
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(body)
      .select('*, category:categories(name)')
      .single();

    if (error) throw error;

    await logAudit({
      actor_user_id: adminUser.id,
      actor_role: adminUser.role,
      action_type: 'create',
      entity_type: 'product',
      entity_id: newProduct.id,
      new_value: body,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error('Create Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { adminUser } = await checkAdmin(supabase);

    if (!adminUser || !['owner', 'manager'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    const { data: oldProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(name)')
      .single();

    if (error) throw error;

    await logAudit({
      actor_user_id: adminUser.id,
      actor_role: adminUser.role,
      action_type: 'update',
      entity_type: 'product',
      entity_id: id,
      previous_value: oldProduct,
      new_value: updates,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    console.error('Update Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { adminUser } = await checkAdmin(supabase);

    // Only 'owner' can delete officially via this API
    if (!adminUser || adminUser.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logAudit({
      actor_user_id: adminUser.id,
      actor_role: adminUser.role,
      action_type: 'delete',
      entity_type: 'product',
      entity_id: id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete Product Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

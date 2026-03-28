import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

/**
 * Admin Single Product API
 * Supports: GET, PATCH (Update), DELETE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const role = await getAdminRole();
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const role = await getAdminRole();
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['owner', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, is_available, category_id, description, image_url, slug } = body;

    // Validation
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json({ error: 'Invalid price. Must be a positive number.' }, { status: 400 });
    }

    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format.' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Check if product exists
    const { data: existing } = await supabase.from('products').select('id').eq('id', id).single();
    if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // 2. Verify category if provided
    if (category_id) {
       const { data: catCheck } = await supabase.from('categories').select('id').eq('id', category_id).single();
       if (!catCheck) return NextResponse.json({ error: 'Invalid category_id.' }, { status: 400 });
    }

    // 3. Perform Update
    const { data, error } = await supabase
      .from('products')
      .update({
        ...(name && { name }),
        ...(slug && { slug }),
        ...(price !== undefined && { price }),
        ...(is_available !== undefined && { is_available }),
        ...(category_id !== undefined && { category_id }),
        ...(description !== undefined && { description }),
        ...(image_url !== undefined && { image_url: image_url || '/images/products/placeholder.png' }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
       if (error.code === '23505') return NextResponse.json({ error: 'Slug conflict' }, { status: 409 });
       throw error;
    }

    return NextResponse.json({ success: true, product: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const role = await getAdminRole();
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can delete products' }, { status: 403 });
    }

    const supabase = await createServiceClient();

    // Safety check: Don't delete if used in orders
    const { data: usage } = await supabase.from('order_items').select('id').eq('product_id', id).limit(1);
    if (usage && usage.length > 0) {
      // Soft delete/Archive instead if it has sales history
      const { error } = await supabase.from('products').update({ is_available: false, name: `[ARCHIVED] ${id}` }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Product archived instead of deleted because it has history.' });
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

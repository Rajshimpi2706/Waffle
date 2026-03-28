import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

/**
 * Admin Product CRUD API
 * Supports: GET (List), POST (Create)
 */
export async function GET(request: NextRequest) {
  try {
    const role = await getAdminRole();
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name)
      `)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, products: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const role = await getAdminRole();
    if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['owner', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden. Role cannot create products.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, slug, description, price, category_id, image_url, is_available } = body;

    // Strict Server-side Validation
    if (!name || !slug || price === undefined || !category_id) {
      return NextResponse.json({ error: 'Missing required fields (name, slug, price, category)' }, { status: 400 });
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: 'Invalid price. Must be a positive number.' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format. Use lowercase and hyphens.' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Verify category exists
    const { data: catCheck } = await supabase.from('categories').select('id').eq('id', category_id).single();
    if (!catCheck) {
      return NextResponse.json({ error: 'Invalid category_id provided.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        description,
        price,
        category_id,
        image_url: image_url || '/images/products/placeholder.png',
        is_available: is_available !== undefined ? is_available : true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product slug already exists. Use a unique name.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, product: data }, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Product POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { order_status } = body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(order_status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminUser) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Capture the existing state for audit log BEFORE the update happens
    const { data: oldOrder } = await supabase
      .from('orders')
      .select('order_status, id')
      .eq('id', id)
      .single();

    // The DB trigger `tr_orders_lifecycle` automatically sets the `<status>_at` timestamp.
    // So we ONLY need to update `order_status`.
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ order_status })
      .eq('id', id)
      .select('id, order_number')
      .single();

    if (error) throw error;

    // Log the action purely for auditing history
    await logAudit({
      actor_user_id: adminUser.id,
      actor_role: adminUser.role,
      action_type: 'update',
      entity_type: 'order_status',
      entity_id: id,
      previous_value: { order_status: oldOrder?.order_status },
      new_value: { order_status },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}

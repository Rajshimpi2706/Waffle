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
    // FIX B1: unified status field is `status`, not `order_status`
    const { status } = body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing order status' }, { status: 400 });
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
      .select('status, id')
      .eq('id', id)
      .single();

    console.log(`[Admin] Status update for order ${id}: ${oldOrder?.status} → ${status} by ${adminUser.role}`);

    // Update using the correct `status` column, consistent with Phase 4 lifecycle model
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('id, order_number')
      .single();

    if (error) throw error;

    // Log the action for auditing history
    await logAudit({
      actor_user_id: adminUser.id,
      actor_role: adminUser.role,
      action_type: 'update',
      entity_type: 'order_status',
      entity_id: id,
      previous_value: { status: oldOrder?.status },
      new_value: { status },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('[Admin] Update Order Status Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}

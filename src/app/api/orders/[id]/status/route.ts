import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'failed', 'refunded'];

/**
 * PATCH /api/orders/[id]/status
 * Admin can freely update order status.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newStatus } = body as { newStatus: string };

    if (!newStatus) {
      return NextResponse.json({ error: 'New status is required' }, { status: 400 });
    }

    const { getAdminRole } = await import('@/lib/adminAuth');
    const role = await getAdminRole();

    if (!role) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Fetch current order to get order_number for logging
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, order_number')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const previousStatus = order.status;

    // Build update payload
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Auto-set the matching timestamp column (e.g., confirmed_at, delivered_at)
    const timestampField = `${newStatus}_at`;
    updateData[timestampField] = new Date().toISOString();

    // Perform update and SELECT the updated row to ensure RLS didn't silently block it
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select('status')
      .single();

    if (updateError || !updatedOrder) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Failed to update status. Please check your Supabase RLS policies for the "orders" table.' }, { status: 500 });
    }

    // Audit Logging (non-blocking)
    try {
      const { logAdminAction } = await import('@/lib/audit');
      await logAdminAction({
        action_type: 'ORDER_STATUS_UPDATE',
        entity_type: 'orders',
        entity_id: id,
        previous_value: { status: previousStatus },
        new_value: { status: newStatus }
      });
    } catch (auditErr) {
      console.warn('Audit log failed (non-critical):', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: `Order ${order.order_number} moved to ${newStatus}`,
      data: { status: newStatus }
    });

  } catch (err: any) {
    console.error('Error in PATCH /api/orders/[id]/status:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

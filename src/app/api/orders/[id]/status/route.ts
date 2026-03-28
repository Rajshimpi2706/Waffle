import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { OrderStatus } from '@/types';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [], // Terminal
  cancelled: [], // Terminal
  refunded: [],  // Terminal
};

/**
 * PATCH /api/orders/[id]/status
 * Securely update order status with transition validation and auto-timestamps.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { newStatus } = body as { newStatus: OrderStatus };

    if (!newStatus || !ALLOWED_TRANSITIONS[newStatus]) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // 1. Fetch current order state
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status, order_number')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status as OrderStatus;

    // 2. Validate Transition
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid transition: ${currentStatus} -> ${newStatus}` },
        { status: 400 }
      );
    }

    // 3. Update Data Preparation
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Auto-set the matching timestamp column
    const timestampField = `${newStatus}_at`;
    updateData[timestampField] = new Date().toISOString();

    // 4. Perform Atomic Update
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // 5. Audit Logging (Optional but recommended)
    try {
      await supabase.from('audit_logs').insert({
        action_type: 'ORDER_STATUS_UPDATE',
        entity_type: 'orders',
        entity_id: id,
        previous_value: { status: currentStatus },
        new_value: { status: newStatus },
        created_at: new Date().toISOString()
      });
    } catch (auditErr) {
      console.error('Audit log failed (non-critical):', auditErr);
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

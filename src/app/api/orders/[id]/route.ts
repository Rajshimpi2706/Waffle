import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { ApiResponse, Order } from '@/types';

/**
 * GET /api/orders/[id]
 * Fetch a single order by UUID or Order Number.
 * For Order Number lookup, last 4 digits of phone must be provided as ?phone=XXXX
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const phoneLast4 = searchParams.get('phone');

    const supabase = await createServiceClient();

    let query = supabase
      .from('orders')
      .select('*, items:order_items(*), payment:payments(*)');

    // Determine if 'id' is a UUID or an Order Number
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('order_number', id);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // SECURITY: If lookup was via Order Number, verify phone digits
    if (!isUuid) {
      if (!phoneLast4) {
        return NextResponse.json(
          { error: 'Verification required' },
          { status: 403 }
        );
      }
      
      const actualPhoneSuffix = order.customer_phone.slice(-4);
      if (actualPhoneSuffix !== phoneLast4) {
        return NextResponse.json(
          { error: 'Invalid verification digits' },
          { status: 403 }
        );
      }
    }

    // Success - Return sanitized order data
    return NextResponse.json({ data: order });

  } catch (err: any) {
    console.error('Error in GET /api/orders/[id]:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

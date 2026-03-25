import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pincode = searchParams.get('pincode');
  const branch_id = searchParams.get('branch_id');

  if (!pincode || !branch_id) {
    return NextResponse.json({ error: 'Missing pincode or branch_id' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('delivery_zones')
      .select('delivery_fee, minimum_order_amount, estimated_delivery_minutes, is_active')
      .eq('branch_id', branch_id)
      .eq('pincode', pincode)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Delivery zone check error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data || !data.is_active) {
       return NextResponse.json({ is_active: false });
    }

    return NextResponse.json({
      is_active: true,
      delivery_fee: data.delivery_fee,
      minimum_order_amount: data.minimum_order_amount,
      estimated_delivery_minutes: data.estimated_delivery_minutes,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

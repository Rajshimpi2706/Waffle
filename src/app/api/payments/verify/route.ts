import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_order_id) {
      return NextResponse.json({ error: 'Missing required payment parameters' }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    const supabase = await createClient();

    if (!isValid) {
      // Log payment failure
      await supabase
        .from('payments')
        .update({ status: 'failed', provider_payment_id: razorpay_payment_id })
        .eq('provider_order_id', razorpay_order_id);
      
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', internal_order_id);
        
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Success — Update Payment
    await supabase
      .from('payments')
      .update({ 
        status: 'completed', 
        provider_payment_id: razorpay_payment_id 
      })
      .eq('provider_order_id', razorpay_order_id);

    // Success — Update Order
    // The DB trigger `tr_orders_lifecycle` will automatically set `confirmed_at` when order_status changes to 'confirmed'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        order_status: 'confirmed'
      })
      .eq('id', internal_order_id)
      .select('order_number, customer_id')
      .single();

    if (orderError) throw orderError;

    // Log Audit (System action)
    await logAudit({
      actor_role: 'system',
      action_type: 'update',
      entity_type: 'order_status',
      entity_id: internal_order_id,
      new_value: { payment_status: 'paid', order_status: 'confirmed', provider_payment_id: razorpay_payment_id },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order_number: order?.order_number
    });

  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

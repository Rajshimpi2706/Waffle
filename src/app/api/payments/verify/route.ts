import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const supabase = await createServiceClient();
    const payload = await request.json();

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      local_order_id,
    } = payload;

    // 1. Basic Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !local_order_id) {
      return NextResponse.json(
        { error: 'Missing required verification fields' },
        { status: 400 }
      );
    }

    // 2. Fetch the existing payment/order record for verification (Idempotency Check)
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('status, id, order_id')
      .eq('order_id', local_order_id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !existingPayment) {
      console.error('Payment record not found for verification:', fetchError);
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // IDEMPOTENCY: If already paid, return safe success
    if (existingPayment.status === 'paid') {
      return NextResponse.json({ 
        success: true, 
        message: 'Payment already verified',
        order_id: existingPayment.order_id 
      });
    }

    // 3. Signature Verification (Server-Side Only)
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid Razorpay signature for order:', local_order_id);
      
      // Update payment record to 'failed'
      await supabase
        .from('payments')
        .update({ 
            status: 'failed', 
            failure_reason: 'Invalid signature',
            razorpay_payment_id 
        })
        .eq('id', existingPayment.id);

      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 4. ATOMIC UPDATE (Idempotent): Update Payment and Order
    // Update Payment
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
      })
      .eq('id', existingPayment.id);

    if (paymentUpdateError) {
      console.error('Error updating payment status:', paymentUpdateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Payment verified but failed to update status', 
        suggestion: `Database error: ${paymentUpdateError.message}` 
      }, { status: 500 });
    }

    // Update Order
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', local_order_id);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to confirm order status', 
        suggestion: `Database error: ${orderUpdateError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed',
      order_id: local_order_id
    });

  } catch (error: any) {
    console.error('Unhandled error in /api/payments/verify:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

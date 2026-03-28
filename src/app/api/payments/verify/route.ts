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
      local_order_id, // This is the UUID from our 'orders' table
    } = payload;

    console.log(`[Verify] Starting verification for Order: ${local_order_id}, RZP Order: ${razorpay_order_id}`);

    // 1. Basic Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !local_order_id) {
      console.error('[Verify] Missing required fields in payload');
      return NextResponse.json(
        { error: 'Missing required verification fields' },
        { status: 400 }
      );
    }

    // 2. Fetch the existing payment record (Verification of intent)
    // We search by BOTH local_order_id (UUID) and razorpay_order_id for safety
    const { data: existingPayment, error: fetchError } = await supabase
      .from('payments')
      .select('status, id, order_id, amount')
      .eq('order_id', local_order_id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !existingPayment) {
      console.error('[Verify] Payment record not found in DB:', {
        local_order_id,
        razorpay_order_id,
        error: fetchError?.message
      });
      return NextResponse.json({ 
        error: 'Payment record not found. Please contact support.',
        details: 'The linked payment record could not be found in our database.'
      }, { status: 404 });
    }

    // IDEMPOTENCY: If already paid, return safe success immediately
    if (existingPayment.status === 'paid') {
      console.log(`[Verify] Order ${local_order_id} is already marked as paid. Returning success.`);
      return NextResponse.json({ 
        success: true, 
        message: 'Payment already verified',
        order_id: existingPayment.order_id 
      });
    }

    // 3. Signature Verification (The core security check)
    // Note: We use the razorpay_order_id from the PAYLOAD as required by Razorpay
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('[Verify] HMAC Signature Mismatch! High suspicion of tampering or secret mismatch.');
      
      // Update payment record to 'failed' for audit
      await supabase
        .from('payments')
        .update({ 
            status: 'failed', 
            failure_reason: 'Signature mismatch (verification failed)',
            razorpay_payment_id 
        })
        .eq('id', existingPayment.id);

      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // 4. ATOMIC UPDATE: Update Payment and then Order Status
    console.log(`[Verify] Signature valid. Updating DB status for Order: ${local_order_id}`);

    // Update Payment record
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
      console.error('[Verify] Failed to update payment status:', paymentUpdateError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database update failed', 
        details: paymentUpdateError.message 
      }, { status: 500 });
    }

    // Update Order record
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
        confirmed_at: new Date().toISOString() // Ensure Phase 4 timestamp is set
      })
      .eq('id', local_order_id);

    if (orderUpdateError) {
      console.error('[Verify] Payment updated but failed to update order status:', orderUpdateError);
      // NOTE: This is a critical partial-success state. 
      // The payment is recorded as paid, but the order is still 'pending'.
      return NextResponse.json({ 
        success: false, 
        error: 'Payment recorded but order confirmation failed',
        details: orderUpdateError.message
      }, { status: 500 });
    }

    console.log(`[Verify] SUCCESS: Order ${local_order_id} confirmed.`);
    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed',
      order_id: local_order_id
    });

  } catch (error: any) {
    console.error('[Verify] UNHANDLED EXCEPTION:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

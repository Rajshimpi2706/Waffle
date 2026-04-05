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

    // 4. UPDATE: Required fields first (status + IDs), timestamps separately
    // HARDENING: Split into two steps so a missing column (e.g. paid_at) in the
    // schema does NOT block the core status update. Without this, a schema mismatch
    // causes the entire verify to fail even though payment was captured by Razorpay.
    console.log(`[Verify] Signature valid. Updating DB status for Order: ${local_order_id}`);

    // Step A: Core payment fields — must succeed
    const { error: paymentCoreError } = await supabase
      .from('payments')
      .update({
        status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq('id', existingPayment.id);

    if (paymentCoreError) {
      console.error('[Verify] CRITICAL: Failed to update payment core status:', paymentCoreError);
      return NextResponse.json({ 
        success: false, 
        error: 'Database update failed', 
        details: paymentCoreError.message 
      }, { status: 500 });
    }

    // Step B: Optional timestamp — non-blocking (column may not exist in older schemas)
    const now = new Date().toISOString();
    const { error: paidAtError } = await supabase
      .from('payments')
      .update({ paid_at: now })
      .eq('id', existingPayment.id);
    if (paidAtError) {
      // Non-fatal: log and continue. Run the SQL migration to add paid_at column.
      console.warn('[Verify] paid_at update skipped (column may be missing from schema):', paidAtError.message);
    }

    // Step C: Core order fields — must succeed
    const { error: orderCoreError } = await supabase
      .from('orders')
      .update({ status: 'confirmed' })
      .eq('id', local_order_id);

    if (orderCoreError) {
      console.error('[Verify] Payment marked paid but order status update failed:', orderCoreError);
      return NextResponse.json({ 
        success: false, 
        error: 'Payment recorded but order confirmation failed',
        details: orderCoreError.message
      }, { status: 500 });
    }

    // Step D: Optional order timestamp — non-blocking
    const { error: confirmedAtError } = await supabase
      .from('orders')
      .update({ confirmed_at: now })
      .eq('id', local_order_id);
    if (confirmedAtError) {
      console.warn('[Verify] confirmed_at update skipped (column may be missing from schema):', confirmedAtError.message);
    }

    console.log(`[Verify] SUCCESS: Order ${local_order_id} confirmed, payment paid.`);
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

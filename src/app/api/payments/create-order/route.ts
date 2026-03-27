import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const supabase = await createServiceClient();
    const payload = await request.json();

    const { 
      customer_name, 
      customer_phone, 
      items, 
    } = payload;

    // 1. Basic Validation
    if (!customer_name || !customer_phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required checkout fields' },
        { status: 400 }
      );
    }

    // 2. Fetch current prices from DB (Zero-Trust Pricing)
    const productIds = items.map((i: any) => i.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (dbError || !dbProducts || dbProducts.length !== productIds.length) {
      const MOCK_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d';
      const hasStaleId = productIds.includes(MOCK_ID);
      
      console.error('Checkout validation failed:', dbError || `Found ${dbProducts?.length || 0} of ${productIds.length} items`);
      
      return NextResponse.json({ 
        error: hasStaleId ? 'Stale cart detected' : 'Failed to validate product prices',
        suggestion: hasStaleId 
          ? 'Please clear your cart and add items again to sync with the new database IDs.' 
          : `Database error: ${dbError?.message || 'Some items may no longer be available.'}`
      }, { status: 500 });
    }

    // Map DB prices for easy lookup
    const priceMap = new Map(dbProducts.map(p => [p.id, Number(p.price)]));
    const nameMap = new Map(dbProducts.map(p => [p.id, p.name]));

    // 3. Recalculate subtotal server-side (Ignore all client-provided totals)
    let calculatedSubtotal = 0;
    const orderItemsPayload = items.map((item: any) => {
      const unitPrice = priceMap.get(item.productId) || 0;
      const quantity = Number(item.quantity) || 0;
      const lineTotal = unitPrice * quantity;
      calculatedSubtotal += lineTotal;

      return {
        product_id: item.productId,
        product_name: nameMap.get(item.productId) || 'Unknown Product',
        quantity: quantity,
        price: unitPrice,
        line_total: lineTotal,
      };
    });

    if (calculatedSubtotal <= 0) {
      return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 });
    }

    // 4. Generate Human-Readable Order Number
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `WW-${today}-${randomSuffix}`;

    // 5. Create Local Order (Status: pending)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_phone,
        subtotal: calculatedSubtotal,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      const isRlsError = (orderError as any)?.code === '42501';
      console.error('Error creating local order:', orderError);
      
      return NextResponse.json({ 
        error: isRlsError ? 'Permission Denied (RLS)' : 'Failed to create local order', 
        suggestion: isRlsError 
          ? 'ACTION REQUIRED: Your database is blocking this order. Copy the SQL from fix_rls.sql and run it in your Supabase SQL Editor.' 
          : `Database error: ${orderError?.message || 'Check your Supabase permissions.'}` 
      }, { status: 500 });
    }

    // 6. Create Order Items (Snapshotting)
    const finalItems = orderItemsPayload.map((oi: any) => ({ ...oi, order_id: order.id }));
    const { error: itemsError } = await supabase.from('order_items').insert(finalItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 });
    }

    // 7. Create Razorpay Order
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(calculatedSubtotal, orderNumber);
    } catch (rpError) {
      console.error('Razorpay Order Creation Error:', rpError);
      return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }

    // 8. Create Pending Payment Record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        razorpay_order_id: razorpayOrder.razorpay_order_id,
        amount: calculatedSubtotal,
        currency: 'INR',
        status: 'pending',
      });

    if (paymentError) {
       console.error('Error creating payment record:', paymentError);
       // We don't block the frontend yet, but this is a critical sync issue
    }

    // 9. Return metadata for Frontend Razorpay Modal
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        amount: razorpayOrder.amount, // in rupees
        currency: razorpayOrder.currency,
        razorpay_order_id: razorpayOrder.razorpay_order_id,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      }
    });

  } catch (error: any) {
    console.error('Unhandled error in /api/payments/create-order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

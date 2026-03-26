import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const payload = await request.json();

    const { 
      customer_name, 
      customer_phone, 
      items, 
    } = payload;

    // Basic Validation
    if (!customer_name || !customer_phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Fetch current prices from DB to validate/snapshot (Security: Don't trust client price)
    const productIds = items.map((i: any) => i.productId);
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (dbError || !dbProducts) {
      console.error('Error fetching prices for validation:', dbError);
      return NextResponse.json({ error: 'Failed to validate product prices' }, { status: 500 });
    }

    // Map DB prices for easy lookup
    const priceMap = new Map(dbProducts.map(p => [p.id, Number(p.price)]));
    const nameMap = new Map(dbProducts.map(p => [p.id, p.name]));

    // Recalculate subtotal server-side
    let calculatedSubtotal = 0;
    const orderItems = items.map((item: any) => {
      const unitPrice = priceMap.get(item.productId) || 0;
      const quantity = Number(item.quantity) || 0;
      const lineTotal = unitPrice * quantity;
      calculatedSubtotal += lineTotal;

      return {
        product_id: item.productId,
        product_name: nameMap.get(item.productId) || item.productName,
        quantity: quantity,
        price: unitPrice,
        line_total: lineTotal,
      };
    });

    // Generate Order Number: WAFFLE-YYYYMMDD-XXXX
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `WAFFLE-${today}-${randomSuffix}`;

    // 1. Create Order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name,
        customer_phone,
        subtotal: calculatedSubtotal, // Use server-calculated value
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order record:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // 2. Create Order Items (Snapshotting names and prices)
    const finalOrderItems = orderItems.map((oi: any) => ({ ...oi, order_id: order.id }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(finalOrderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json(
        { error: 'Order created but failed to save items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: order.id,
        order_number: order.order_number
      }
    });

  } catch (error) {
    console.error('Unhandled error in /api/orders/create:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

/**
 * Admin Customer Insights API
 * Calculates: Total Spent (LTV), Order Count, and Last Order Date.
 */
export async function GET(request: NextRequest) {
  try {
    const role = await getAdminRole();
    if (!['owner', 'manager'].includes(role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServiceClient();

    // We aggregate customer data from the orders table to get LTV and order counts.
    // In a high-traffic app, this might be a materialized view or updated via triggers.
    const { data, error } = await supabase
      .from('orders')
      .select(`
        customer_phone,
        customer_name,
        total_amount,
        created_at,
        payments!inner(status)
      `)
      .eq('payments.status', 'paid');

    if (error) throw error;

    // Aggregate by phone number (unique customer identifier for Waffle Wala)
    const customerMap: Record<string, { name: string; phone: string; orderCount: number; totalSpent: number; lastOrder: string }> = {};

    data.forEach(order => {
      const phone = order.customer_phone;
      if (!customerMap[phone]) {
        customerMap[phone] = {
          name: order.customer_name,
          phone: phone,
          orderCount: 0,
          totalSpent: 0,
          lastOrder: order.created_at
        };
      }

      customerMap[phone].orderCount += 1;
      customerMap[phone].totalSpent += order.total_amount;
      if (new Date(order.created_at) > new Date(customerMap[phone].lastOrder)) {
        customerMap[phone].lastOrder = order.created_at;
      }
    });

    const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

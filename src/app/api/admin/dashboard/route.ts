import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

/**
 * Admin Dashboard Stats API
 * Calculates: Today's Revenue, Order Volume, Active Orders, and Customer Stats.
 */
export async function GET(request: NextRequest) {
  try {
    const role = await getAdminRole();
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    if (!['owner', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden. Insufficient permissions.' }, { status: 403 });
    }

    const supabase = await createClient();

    // Today's boundaries (Kolkata time for business operations)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();

    // 1. Fetch Today's Metrics (Total Sales & Count)
    // We join with 'payments' to ensure we only count 'paid' revenue
    const { data: todayOrders, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        payments!inner(status)
      `)
      .gte('created_at', todayStartISO)
      .eq('payments.status', 'paid');

    if (orderError) throw orderError;

    const todayRevenue = todayOrders?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
    const todayOrderCount = todayOrders?.length || 0;

    // 2. Total Customers
    const { count: customerCount, error: customerError } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });

    if (customerError) throw customerError;

    // 3. Active Orders (All non-terminal states)
    const { count: activeOrderCount, error: activeError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']);

    if (activeError) throw activeError;

    // 4. Pending Orders Only (New KPI)
    const { count: pendingOrderCount, error: pendingError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // 5. Total Today's Orders (Volume)
    const { count: totalTodayOrders, error: todayVolumeError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStartISO);

    if (todayVolumeError) throw todayVolumeError;

    // 6. Recent Orders Table (Spotlight)
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        status,
        total_amount,
        created_at,
        payments(status),
        customer:customers(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    // Calculate Repeat Customers (Customers with > 1 order)
    const { data: customerStats } = await supabase.rpc('get_repeat_customer_count');
    let repeatCustomers = 0;
    if (customerStats !== null && customerStats !== undefined) {
      repeatCustomers = customerStats;
    }

    return NextResponse.json({
      success: true,
      stats: {
        todayRevenue,
        todayOrderCount: totalTodayOrders || 0, // Using total volume for this KPI as per user request
        totalCustomers: customerCount || 0,
        activeOrders: activeOrderCount || 0,
        pendingOrders: pendingOrderCount || 0,
        repeatCustomers
      },
      recentOrders: recentOrders?.map(o => ({
        ...o,
        payment_status: o.payments?.[0]?.status || 'pending'
      })) || []
    });

  } catch (error: any) {
    console.error('[Admin Dashboard API] Unhandled Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const role = await getAdminRole();
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Service Client for administrative dashboard stats
    // This ensures consistent visibility of orders from all users
    const supabase = await createServiceClient();

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();

    // 1. Fetch Today's Stats
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', todayStart);

    if (todayError) console.error('[Dashboard API] Today Orders Error:', todayError);

    const todayRevenue = todayOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
    const todayOrderCount = todayOrders?.length || 0;

    // 2. Active Orders Count (Live count of processing orders)
    const { count: activeOrders, error: activeError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']);

    if (activeError) console.error('[Dashboard API] Active Orders Error:', activeError);

    // 3. Pending Orders (Specific count for 'pending' state)
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // 4. Global Stats
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });

    const { data: allRevenueData } = await supabase
      .from('orders')
      .select('total_amount');
    
    const totalRevenue = allRevenueData?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
    const totalOrders = allRevenueData?.length || 0;

    // 5. Repeat Customers (RPC check)
    let repeatCustomers = 0;
    try {
      const { data: rpcData } = await supabase.rpc('get_repeat_customer_count');
      if (rpcData !== null && rpcData !== undefined) repeatCustomers = rpcData;
    } catch {}

    // 6. Recent Orders (The main feed)
    // Simplified select to avoid any join bottlenecks while maintaining required UI fields
    const { data: recentOrders, error: recentError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        status,
        total_amount,
        created_at,
        customer:customers(full_name, phone, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) {
      console.error('[Dashboard API] Recent Orders Fetch Error:', recentError);
    }

    return NextResponse.json({
      success: true,
      stats: {
        todayRevenue,
        todayOrderCount,
        totalRevenue,
        totalOrders,
        activeOrders: activeOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        repeatCustomers,
      },
      recentOrders: recentOrders || [],
    });

  } catch (error: any) {
    console.error('[Admin Dashboard API] Unhandled Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}

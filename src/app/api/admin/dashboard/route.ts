import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminRole } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const role = await getAdminRole();
    if (!role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();

    // Fetch all today's orders
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_amount, status')
      .gte('created_at', todayStartISO);

    const todayRevenue = todayOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
    const todayOrderCount = todayOrders?.length || 0;

    // Active orders count
    const { count: activeOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']);

    // Pending orders count
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Total customers
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });

    // All time revenue
    const { data: allOrders } = await supabase
      .from('orders')
      .select('total_amount');
    const totalRevenue = allOrders?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;

    // Total orders count
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });

    // Repeat customers — safe fallback if RPC missing
    let repeatCustomers = 0;
    try {
      const { data: rpcData } = await supabase.rpc('get_repeat_customer_count');
      if (rpcData !== null && rpcData !== undefined) {
        repeatCustomers = rpcData;
      }
    } catch {
      // RPC not available, skip
    }

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        status,
        total_amount,
        created_at,
        payments(status),
        customer:customers(full_name, phone, email)
      `)
      .order('created_at', { ascending: false })
      .limit(8);

    return NextResponse.json({
      success: true,
      stats: {
        todayRevenue,
        todayOrderCount,
        totalRevenue,
        totalOrders: totalOrders || 0,
        activeOrders: activeOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        repeatCustomers,
      },
      recentOrders: (recentOrders || []).map(o => ({
        ...o,
        payment_status: (o.payments as any)?.[0]?.status || 'pending',
      })),
    });

  } catch (error: any) {
    console.error('[Admin Dashboard API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error.message },
      { status: 500 }
    );
  }
}

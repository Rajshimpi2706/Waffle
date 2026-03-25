import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user is an admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (!adminUser) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get today's start and end timestamps in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. Fetch today's orders count and revenue (completed/paid)
    const { data: todayOrders } = await supabase
      .from('orders')
      .select('id, total_amount')
      .gte('created_at', todayISO)
      .eq('payment_status', 'paid');
      
    const todayRevenue = todayOrders?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
    const todayOrderCount = todayOrders?.length || 0;

    // 2. Fetch total active customers
    const { count: customerCount } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });

    // 3. Fetch recent pending/preparing orders for the main table
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        order_type,
        order_status,
        payment_status,
        total_amount,
        created_at,
        customer:customers(full_name)
      `)
      .in('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'])
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        todayRevenue,
        todayOrderCount,
        totalCustomers: customerCount || 0,
        activeOrders: recentOrders?.length || 0
      },
      recentOrders: recentOrders || []
    });

  } catch (error: any) {
    console.error('Admin Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

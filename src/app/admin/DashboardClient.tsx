'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IndianRupee, ShoppingBag, Users, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export function DashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error('Could not load dashboard stats');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4 bg-white p-8 rounded-xl h-64">Loading dashboard...</div>;
  }

  const stats = [
    { label: "Total Revenue", value: formatCurrency(data.stats.todayRevenue), icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-100' },
    { label: "Today's Orders", value: data.stats.todayOrderCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: "Pending Orders", value: data.stats.pendingOrders, icon: Clock, color: 'text-[#C17839]', bg: 'bg-[#FDF6EC]' },
    { label: "Repeat Customers", value: data.stats.repeatCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-gray-900">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-gray-500">Here's what's happening at your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.bg} ${s.color}`}>
                 <Icon size={24} />
              </div>
              <div>
                 <p className="text-sm font-medium text-gray-500">{s.label}</p>
                 <h3 className="text-2xl font-bold mt-0.5">{s.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/admin/orders" className="text-sm text-[#C17839] hover:underline flex items-center gap-1 font-medium">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Order Number</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOrders.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No recent orders found.</td>
                </tr>
              ) : (
                data.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4 capitalize">{order.customer?.full_name || 'Guest'}</td>
                    <td className="px-6 py-4 capitalize">{order.order_type}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(order.total_amount)}</td>
                    <td className="px-6 py-4">
                       <Badge variant={order.payment_status === 'paid' ? 'success' : 'secondary' as any} className="uppercase text-[10px]">
                         {order.payment_status}
                       </Badge>
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={order.status === 'pending' ? 'secondary' : 'gold' as any} className="capitalize text-[10px]">
                         {order.status.replace(/_/g, ' ')}
                       </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

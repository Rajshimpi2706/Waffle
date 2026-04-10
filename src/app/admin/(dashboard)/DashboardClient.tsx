'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { IndianRupee, ShoppingBag, Users, Clock, ArrowRight, TrendingUp, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  failed: 'bg-red-100 text-red-700',
};

export function DashboardClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch stats');
      setData(json);
    } catch (err: any) {
      setError(err.message);
      toast.error('Could not load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // --- Loading State ---
  if (loading) {
    return (
      <div className="space-y-8 pb-20">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-[#F5E6CC] rounded-2xl w-56 animate-pulse" />
          <div className="h-10 bg-[#F5E6CC] rounded-2xl w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-white rounded-[2rem] border border-[#F5E6CC] animate-pulse" />
          ))}
        </div>
        <div className="h-[420px] bg-white rounded-[2.5rem] border border-[#F5E6CC] animate-pulse" />
      </div>
    );
  }

  // --- Error State ---
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center">
          <AlertCircle size={40} className="text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-serif font-black text-[#3B1F0A]">Could Not Load Dashboard</h2>
          <p className="text-[#8B5E3C] mt-2 text-sm opacity-70">{error || 'An unexpected error occurred.'}</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-8 py-4 bg-[#3B1F0A] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const { stats, recentOrders } = data;

  const statCards = [
    {
      label: "Today's Revenue",
      value: formatCurrency(stats?.todayRevenue ?? 0),
      sub: `${stats?.todayOrderCount ?? 0} orders today`,
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      trend: '↑ Live',
    },
    {
      label: 'Active Orders',
      value: stats?.activeOrders ?? 0,
      sub: `${stats?.pendingOrders ?? 0} pending action`,
      icon: ShoppingBag,
      color: 'text-[#C17839]',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      trend: 'Real-time',
    },
    {
      label: 'All-Time Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0),
      sub: `${stats?.totalOrders ?? 0} total orders`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      trend: 'Since launch',
    },
    {
      label: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      sub: `${stats?.repeatCustomers ?? 0} repeat buyers`,
      icon: Users,
      color: 'text-[#3B1F0A]',
      bg: 'bg-[#FDF6EC]',
      border: 'border-[#F5E6CC]',
      trend: 'Growing',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 pb-24 lg:pb-20 text-[#3B1F0A]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-black tracking-tighter">
            Business <span className="text-[#C17839]">Pulse</span>
          </h1>
          <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.3em] mt-1.5 opacity-60">
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-white px-5 py-3 rounded-2xl shadow-sm border border-[#F5E6CC]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-[#3B1F0A] uppercase tracking-widest">Store Online</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="p-3 bg-white rounded-2xl border border-[#F5E6CC] shadow-sm hover:bg-[#FDF6EC] transition-all group shrink-0"
          >
            <RefreshCw size={16} className="text-[#8B5E3C] group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`bg-white p-6 lg:p-7 rounded-[2rem] border ${s.border} shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden relative`}
            >
              {/* Ghost icon bg */}
              <div className="absolute -right-3 -top-3 opacity-[0.04] group-hover:scale-110 transition-transform duration-700">
                <Icon size={90} />
              </div>

              <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-5 border ${s.border}`}>
                <Icon size={22} />
              </div>

              <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-70 mb-1">{s.label}</p>
              <h3 className="text-[1.75rem] lg:text-[2rem] font-serif font-black tracking-tight leading-none">{s.value}</h3>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-[#8B5E3C] opacity-60">{s.sub}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${s.color} opacity-70`}>{s.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-[#F5E6CC] shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 lg:px-8 py-5 lg:py-6 border-b border-[#FDF6EC] bg-gradient-to-r from-white to-[#FDF6EC]/40 gap-4">
          <div>
            <h2 className="text-xl font-serif font-black tracking-tight">Recent Orders</h2>
            <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-0.5 opacity-50">Latest transactions</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3B1F0A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all hover:gap-3 group active:scale-95"
          >
            All Orders <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {(!recentOrders || recentOrders.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 lg:py-24 gap-4">
            <div className="w-16 h-16 bg-[#FDF6EC] rounded-[1.5rem] flex items-center justify-center">
              <Package size={32} className="text-[#D5AD85]" />
            </div>
            <p className="text-[#8B5E3C] font-serif font-bold text-lg">No orders yet</p>
            <p className="text-[#A17C5F] text-sm opacity-60">Orders will appear here once placed.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FDF6EC]/60">
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Order</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Type</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-left text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FDF6EC]">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-[#FDF6EC]/30 transition-colors group">
                      <td className="px-8 py-5">
                        <span className="font-serif font-black text-[#3B1F0A] group-hover:text-[#C17839] transition-colors text-base">
                          #{order.order_number}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-[#3B1F0A] text-sm">
                          {order.customer?.full_name || 'Anonymous'}
                        </p>
                        {(() => {
                          const phone = order.customer?.phone;
                          if (!phone || String(phone).length < 5) return null;
                          return (
                            <p className="text-[11px] text-[#C17839] font-semibold mt-0.5">
                              📞 {phone}
                            </p>
                          );
                        })()}
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-[#FDF6EC] text-[#3B1F0A] text-[10px] font-black uppercase tracking-widest border border-[#F5E6CC]">
                          {order.order_type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-serif font-black text-[#3B1F0A] text-base">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[11px] text-[#A17C5F] font-medium opacity-70">
                          {format(new Date(order.created_at), 'hh:mm a')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="bg-[#FDF6EC]/30 rounded-2xl p-5 border border-[#F5E6CC]/40 relative active:scale-[0.98] transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-serif font-black text-[#3B1F0A] text-lg">#{order.order_number}</span>
                      <p className="text-[9px] font-bold text-[#A17C5F] uppercase tracking-widest mt-0.5">{format(new Date(order.created_at), 'hh:mm a')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#3B1F0A] text-sm">{order.customer?.full_name || 'Anonymous'}</p>
                      <span className="text-[9px] font-black text-[#C17839] uppercase tracking-tighter">{order.order_type}</span>
                    </div>
                    <span className="font-serif font-black text-[#3B1F0A] text-lg">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

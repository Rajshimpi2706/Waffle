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
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-10 bg-gray-200 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-[2rem]" />)}
        </div>
        <div className="h-96 bg-gray-50 rounded-[3rem]" />
      </div>
    );
  }

  const stats = [
    { label: "Today's Revenue", value: formatCurrency(data.stats.todayRevenue), icon: IndianRupee, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', trend: '+12% from yesterday' },
    { label: "Active Orders", value: data.stats.todayOrderCount, icon: ShoppingBag, color: 'text-[#C17839]', bg: 'bg-[#C17839]/10', trend: 'Live updates enabled' },
    { label: "Pending Prep", value: data.stats.pendingOrders, icon: Clock, color: 'text-[#E8A535]', bg: 'bg-[#E8A535]/10', trend: 'Wait time: ~12m' },
    { label: "Loyal Customers", value: data.stats.repeatCustomers, icon: Users, color: 'text-[#3B1F0A]', bg: 'bg-[#3B1F0A]/10', trend: '4 new this week' },
  ];

  return (
    <div className="space-y-10 animate-fade-in text-[#3B1F0A] pb-20">
      
      {/* Premium Header Architecture */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black tracking-tighter">Business <span className="text-[#C17839]">Pulse</span></h1>
          <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.3em] mt-2 opacity-60">Real-time Performance Metrics</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-soft border border-[#F5E6CC]">
           <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
           <span className="text-xs font-black text-[#3B1F0A] uppercase tracking-widest">Store Online</span>
        </div>
      </div>

      {/* Stats Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#F5E6CC] shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                 <Icon size={80} />
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.bg} ${s.color} mb-6 shadow-sm border border-white/50`}>
                 <Icon size={28} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mb-1 opacity-60">{s.label}</p>
                 <h3 className="text-3xl font-serif font-black tracking-tight">{s.value}</h3>
                 <p className="text-[10px] font-bold text-[#8B5E3C] mt-3 bg-[#FDF6EC] w-fit px-2 py-0.5 rounded-lg border border-[#F5E6CC]/30 opacity-70">
                    {s.trend}
                 </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table Architecture */}
      <div className="bg-white rounded-[3rem] shadow-medium border border-[#F5E6CC] overflow-hidden relative">
        <div className="p-10 border-b border-[#FDF6EC] flex items-center justify-between bg-gradient-to-r from-white to-[#FDF6EC]/30">
          <div>
            <h2 className="text-2xl font-serif font-black tracking-tight">Recent Activity</h2>
            <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-50">Latest Customer Transactions</p>
          </div>
          <Link 
            href="/admin/orders" 
            className="flex items-center gap-2 px-6 py-3 bg-[#3B1F0A] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all hover:translate-x-1"
          >
            Insights <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FDF6EC]/50">
              <tr>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Reference</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Client</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Configuration</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Valuation</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Security</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FDF6EC]">
              {data.recentOrders.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-10 py-16 text-center text-[#8B5E3C] font-medium italic opacity-50">
                      "Silence is golden, but orders are better. Waiting for your first sale!"
                   </td>
                </tr>
              ) : (
                data.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-[#FDF6EC]/20 transition-all group">
                    <td className="px-10 py-8 font-serif font-black text-[#3B1F0A] group-hover:text-[#C17839] transition-colors">
                       #{order.order_number}
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-bold text-[#3B1F0A] capitalize">{order.customer?.full_name || 'Anonymous Guest'}</p>
                       <p className="text-[10px] font-black text-[#A17C5F] opacity-50 tracking-widest">{order.customer_phone}</p>
                    </td>
                    <td className="px-10 py-8">
                       <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#FDF6EC] text-[#3B1F0A] text-[10px] font-black uppercase tracking-widest border border-[#F5E6CC]">
                          {order.order_type}
                       </span>
                    </td>
                    <td className="px-10 py-8 font-serif font-black text-[#3B1F0A]">
                       {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-10 py-8">
                       <Badge variant={order.payment_status === 'paid' ? 'success' : 'secondary' as any} className="uppercase text-[10px] font-black tracking-widest rounded-full px-4 border shadow-sm">
                         {order.payment_status}
                       </Badge>
                    </td>
                    <td className="px-10 py-8">
                       <Badge variant={order.status === 'pending' ? 'secondary' : 'gold' as any} className="capitalize text-[10px] font-black tracking-widest rounded-full px-4 border shadow-sm">
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

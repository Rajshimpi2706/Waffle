'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  Calendar,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'totalSpent' | 'orderCount' | 'lastOrder'>('totalSpent');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch('/api/admin/customers');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCustomers(data.customers);
      } catch (err: any) {
        toast.error('Failed to load customers: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers
    .filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    )
    .sort((a, b) => {
      if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
      if (sortBy === 'orderCount') return b.orderCount - a.orderCount;
      if (sortBy === 'lastOrder') return new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime();
      return 0;
    });

  if (loading) {
    return <div className="h-96 flex items-center justify-center animate-pulse bg-white rounded-2xl border border-gray-100">Analyzing customer base...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-gray-900 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Customer Insights</h1>
        <p className="text-gray-500 text-sm mt-1">Understand your audience and track Lifetime Value (LTV).</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
             <Users size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-gray-500">Total Patrons</p>
             <h3 className="text-2xl font-bold mt-0.5">{customers.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600">
             <TrendingUp size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-gray-500">Average LTV</p>
             <h3 className="text-2xl font-bold mt-0.5">
               {customers.length > 0 
                 ? formatCurrency(customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length) 
                 : '₹0'}
             </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
             <Calendar size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-gray-500">Repeat Rate</p>
             <h3 className="text-2xl font-bold mt-0.5">
               {customers.length > 0 
                 ? `${((customers.filter(c => c.orderCount > 1).length / customers.length) * 100).toFixed(1)}%` 
                 : '0%'}
             </h3>
          </div>
        </div>
      </div>

      {/* List Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        
        {/* Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <Input 
               placeholder="Search by name or phone..." 
               className="pl-10 h-10"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="flex gap-2 items-center text-xs font-bold uppercase text-gray-400">
            <ArrowUpDown size={14} /> Sort By:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-[#C17839] capitalize"
            >
              <option value="totalSpent">Lifetime Spent</option>
              <option value="orderCount">Order Count</option>
              <option value="lastOrder">Last Visit</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer Information</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                     No customers found matching your criteria.
                   </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                           {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-gray-900 capitalize">{customer.name.toLowerCase()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 font-mono">
                        <Phone size={14} className="opacity-50" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                       <Badge variant={customer.orderCount > 1 ? 'gold' : 'secondary'} className="rounded-full px-3">
                         {customer.orderCount} {customer.orderCount === 1 ? 'order' : 'orders'}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(customer.lastOrder), 'dd MMM yyyy')}
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

'use client';

import { useState } from 'react';
import { Search, Download, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = initialCustomers.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  const handleExportCSV = () => {
    try {
      const headers = ['Name', 'Phone', 'Joined Date', 'Total Orders', 'Lifetime Spend (INR)', 'Last Order Date'];
      const csvContent = [
        headers.join(','),
        ...filteredCustomers.map(c => [
          `"${c.full_name || 'Guest'}"`,
          `"${c.phone || 'N/A'}"`,
          `"${format(new Date(c.joined_at), 'yyyy-MM-dd')}"`,
          c.total_orders,
          c.total_spend,
          c.last_order_at ? `"${format(new Date(c.last_order_at), 'yyyy-MM-dd')}"` : '"Never"'
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `waffle_customers_export_${format(new Date(), 'yyyyMMdd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV Export downloaded');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <Input 
             placeholder="Search by name or phone..." 
             className="pl-10"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        
        <Button onClick={handleExportCSV} variant="outline" className="w-full sm:w-auto flex items-center gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-sm text-left align-middle">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium text-center">Total Orders</th>
              <th className="px-6 py-4 font-medium text-right">Lifetime Spend</th>
              <th className="px-6 py-4 font-medium text-right">Last Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Users size={32} className="mx-auto text-gray-300 mb-3" />
                  <p>No customers found.</p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{customer.full_name || 'Guest User'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{customer.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(customer.joined_at), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {customer.total_orders > 0 ? (
                      <Badge variant={customer.total_orders > 3 ? 'gold' : 'secondary' as any} className="font-mono">
                        {customer.total_orders}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {customer.total_spend > 0 ? formatCurrency(customer.total_spend) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500 text-xs">
                    {customer.last_order_at ? format(new Date(customer.last_order_at), 'MMM d, yyyy') : 'No orders yet'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}

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
    <div className="space-y-6 lg:space-y-8 animate-fade-in text-[#3B1F0A] pb-24 lg:pb-20">
      
      {/* Premium Controls Architecture */}
      <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-5 lg:p-8 shadow-soft border border-[#F5E6CC] flex flex-col lg:flex-row gap-5 lg:gap-6 justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C17839]/10" />
        
        <div className="relative w-full lg:w-96 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" size={18} />
           <Input 
             placeholder="Search by name or connection string..." 
             className="pl-12 h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-2xl focus:shadow-premium transition-all font-bold"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        
        <Button 
          onClick={handleExportCSV} 
          variant="outline" 
          className="h-14 rounded-2xl border-[#F5E6CC] flex gap-3 px-8 text-[#3B1F0A] font-black uppercase tracking-widest text-[10px] hover:bg-[#FDF6EC] hover:shadow-soft transition-all active:scale-95 group w-full lg:w-auto"
        >
          <Download size={16} className="group-hover:-translate-y-1 transition-transform" /> 
          Export Database
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[3rem] shadow-medium border border-[#F5E6CC] overflow-hidden relative">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm text-left align-middle">
            <thead className="bg-[#FDF6EC]/50">
              <tr>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Customer Profile</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px]">Registration Date</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px] text-center">Frequency</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px] text-right">Lifetime Valuation</th>
                <th className="px-10 py-6 font-black text-[#A17C5F] uppercase tracking-widest text-[10px] text-right">Last Interaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FDF6EC]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <EmptyCustomersState />
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FDF6EC]/20 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-serif font-black text-[#3B1F0A] text-lg group-hover:text-[#C17839] transition-colors tracking-tight">
                        {customer.full_name || 'Anonymous Guest'}
                      </p>
                      <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-50">
                        {customer.phone || 'Connection Unverified'}
                      </p>
                    </td>
                    <td className="px-10 py-8 text-[#8B5E3C] font-bold text-xs">
                      {format(new Date(customer.joined_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-10 py-8 text-center">
                      {customer.total_orders > 0 ? (
                        <Badge variant={customer.total_orders > 3 ? 'gold' : 'secondary' as any} className="font-serif font-black text-[10px] tracking-widest rounded-full px-4 border shadow-sm">
                          {customer.total_orders} Orders
                        </Badge>
                      ) : (
                        <span className="text-[#F5E6CC] font-black italic">Passive</span>
                      )}
                    </td>
                    <td className="px-10 py-8 text-right font-serif font-black text-[#3B1F0A] text-lg">
                      {customer.total_spend > 0 ? formatCurrency(customer.total_spend) : '₹0.00'}
                    </td>
                    <td className="px-10 py-8 text-right text-[#8B5E3C] text-[10px] font-black uppercase tracking-widest opacity-60">
                      {customer.last_order_at ? format(new Date(customer.last_order_at), 'dd MMM, yyyy') : 'No History'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 lg:p-24 border border-[#F5E6CC] text-center shadow-soft">
            <EmptyCustomersState />
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-[2rem] p-6 shadow-soft border border-[#F5E6CC] space-y-4 active:scale-[0.98] transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif font-black text-[#3B1F0A] text-lg tracking-tight leading-tight">
                    {customer.full_name || 'Anonymous Guest'}
                  </h4>
                  <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-0.5 opacity-60">
                    {customer.phone || 'Connection Unverified'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif font-black text-[#C17839] text-base">{customer.total_spend > 0 ? formatCurrency(customer.total_spend) : '₹0.00'}</p>
                  <p className="text-[8px] font-black text-[#A17C5F] uppercase tracking-widest">Lifetime</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#FDF6EC]">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-[#A17C5F] uppercase tracking-widest opacity-50">Frequency</p>
                  {customer.total_orders > 0 ? (
                    <p className="text-[10px] font-black text-[#3B1F0A] uppercase tracking-tighter">{customer.total_orders} Orders</p>
                  ) : (
                    <p className="text-[10px] font-bold text-[#F5E6CC] italic uppercase tracking-tighter">Passive</p>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[8px] font-black text-[#A17C5F] uppercase tracking-widest opacity-50">Last Seen</p>
                  <p className="text-[10px] font-black text-[#3B1F0A] uppercase tracking-tighter">
                    {customer.last_order_at ? format(new Date(customer.last_order_at), 'dd MMM, yy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  );
}

function EmptyCustomersState() {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
       <div className="w-16 lg:w-20 h-16 lg:h-20 bg-[#FDF6EC] rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center text-[#F5E6CC]">
          <Users size={40} />
       </div>
       <div>
          <p className="text-xl lg:text-2xl font-serif font-black text-[#3B1F0A]">No Clients Detected</p>
          <p className="text-[#8B5E3C] mt-2 font-medium italic opacity-60 text-sm lg:text-base">"The catalog is empty. Time for a marketing blast?"</p>
       </div>
    </div>
  );
}

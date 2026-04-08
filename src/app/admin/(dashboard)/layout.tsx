import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

import { protectAdminPage } from '@/lib/adminAuth';

export const metadata = {
  title: 'Admin Dashboard | Waffle House',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Robust Server-Side Guard
  const role = await protectAdminPage(['owner', 'manager', 'staff']);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Menu & Products', href: '/admin/products', icon: Package },
    { label: 'Customers', href: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex">
      {/* Premium Sidebar Architecture */}
      <aside className="w-80 p-8 hidden lg:flex flex-col fixed inset-y-0 z-10">
        <div className="flex-1 bg-white rounded-[3rem] border border-[#F5E6CC] shadow-premium flex flex-col overflow-hidden">
          
          <div className="p-10 border-b border-[#FDF6EC]">
            <Link href="/admin" className="block group">
              <span className="font-serif text-3xl font-black tracking-tighter text-[#3B1F0A] group-hover:text-[#C17839] transition-colors">
                Waffle<span className="text-[#C17839]">Wala</span>.
              </span>
              <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] mt-2 opacity-50">Admin Protocol</p>
            </Link>
            
            <div className="mt-10 p-5 bg-[#FDF6EC]/50 rounded-3xl border border-[#F5E6CC] flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#3B1F0A] text-white flex items-center justify-center font-serif font-black text-xl shadow-md border border-white/20">
                 {user?.email?.charAt(0).toUpperCase() || 'A'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-xs font-black text-[#3B1F0A] truncate tracking-tight">{user?.email || 'Admin'}</p>
                 <p className="text-[9px] font-bold text-[#C17839] uppercase tracking-widest mt-0.5">{role}</p>
               </div>
            </div>
          </div>
          
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#8B5E3C] hover:text-[#C17839] hover:bg-[#FDF6EC] transition-all hover:translate-x-1 group"
                >
                  <Icon size={18} className="group-hover:scale-110 transition-transform" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-[#FDF6EC]">
             <Link href="/" className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 transition-all active:scale-95">
                <LogOut size={16} /> Exit To Store
             </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 p-8 lg:p-16 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

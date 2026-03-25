import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

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

  if (!user) {
    redirect('/admin/login');
  }

  // Middleware already checks if user is active admin, but we can fetch role for UI
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('role, last_login_at')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminUser) {
    redirect('/admin/login?reason=unauthorized');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Menu & Products', href: '/admin/products', icon: Package },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-10">
        <div className="p-6 border-b border-gray-200">
          <Link href="/admin" className="font-serif text-2xl font-bold tracking-tight text-[#3B1F0A]">
            Waffle<span className="text-[#C17839]">Admin</span>.
          </Link>
          <div className="mt-4 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#E8A535] text-[#3B1F0A] flex items-center justify-center font-bold text-sm">
               {user.email?.charAt(0).toUpperCase()}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
               <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-[#C17839] hover:bg-[#FDF6EC] transition-colors"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
           {/* In a real app, this would be a client component trigger to logout */}
           <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={18} /> Storefront
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

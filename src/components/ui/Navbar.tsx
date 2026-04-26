'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User, ArrowRight, Home, UtensilsCrossed, Receipt, Heart, Info, Share2, Mail } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { createClient } from '@/lib/supabase/client';
import { Button } from './Button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const cartItemCount = useCartStore((state) => state.itemCount);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggingOut(false);
    window.location.reload();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-[#F5E6CC]/20 py-3 md:py-4 ${isScrolled
            ? 'bg-white shadow-[0_2px_20px_rgba(59,31,10,0.08)]'
            : 'bg-[#FDF6EC]/80 backdrop-blur-xl'
          }`}
      >
        <div className="safe-container">
          <div className="flex items-center justify-between gap-2">
            {/* Logo Architecture */}
            <Link href="/" className="flex flex-col group relative py-1 shrink-0">
              <span className="font-serif text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-[#3B1F0A] group-hover:text-[#C17839] transition-colors duration-500 leading-none">
                Waffle<span className="text-[#C17839] group-hover:text-[#3B1F0A] transition-colors duration-500">Wala</span>.
              </span>
              <span className="hidden sm:block text-[11px] md:text-[12px] uppercase font-black tracking-[0.3em] md:tracking-[0.4em] text-[#8B5E3C] opacity-70 mt-1.5 leading-none transition-all duration-500 group-hover:tracking-[0.5em] group-hover:opacity-100">
                Har Bite Mein Happiness
              </span>
            </Link>

            {/* Desktop Navigation Architecture */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:text-[#C17839] relative group/link px-2 py-1 ${pathname === link.href ? 'text-[#C17839]' : 'text-[#8B5E3C]'
                    }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 w-full h-[1.5px] bg-[#C17839] transition-transform duration-500 scale-x-0 group-hover/link:scale-x-100 origin-right group-hover/link:origin-left ${pathname === link.href ? 'scale-x-100' : ''}`} />
                </Link>
              ))}
            </nav>

            {/* Premium Actions Architecture */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              
              {/* Desktop-only text Login/Profile button */}
              {user ? (
                <Link
                  href="/account"
                  className="hidden md:flex relative px-4 py-2.5 bg-[#FDF6EC] text-[#3B1F0A] hover:bg-[#C17839] hover:text-white rounded-2xl transition-all duration-500 group/user items-center justify-center font-bold text-xs uppercase tracking-widest gap-2"
                >
                  <User size={16} />
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex relative px-6 py-2.5 bg-[#3B1F0A] text-white hover:bg-black rounded-2xl transition-all duration-500 group/login items-center justify-center font-bold text-xs uppercase tracking-widest"
                >
                  Login
                </Link>
              )}


              {/* Cart Toggle */}
              <button
                onClick={() => document.dispatchEvent(new CustomEvent('open-cart'))}
                aria-label="Open cart"
                className="relative p-2.5 text-[#3B1F0A] hover:bg-[#FDF6EC] hover:text-[#C17839] rounded-xl transition-all duration-500 group/cart flex items-center justify-center min-h-[44px] min-w-[44px] active:scale-95"
              >
                <ShoppingBag size={21} strokeWidth={2} className="group-hover/cart:scale-110 transition-transform duration-500" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-[#C17839] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg transform group-hover/cart:-translate-y-0.5 transition-transform">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2.5 text-[#3B1F0A] bg-[#FDF6EC] rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-all active:scale-95"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Side Drawer (Stitch Design) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Dark Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-[#FDF6EC] shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Profile Section */}
          <div className="pt-14 pb-8 px-8 border-b border-[#EADDCE]">
            <div className="w-16 h-16 rounded-full border-[1.5px] border-[#3B1F0A] overflow-hidden bg-white mb-4 flex items-center justify-center">
               <User size={32} strokeWidth={1.5} className="text-[#3B1F0A]" />
            </div>
            {user ? (
              <>
                <h2 className="font-serif text-[22px] font-bold text-[#3B1F0A] tracking-tight leading-tight">Artisan Member</h2>
                <p className="text-[13px] text-[#5C4033] mt-1">{user.email}</p>
              </>
            ) : (
              <>
                <h2 className="font-serif text-[22px] font-bold text-[#3B1F0A] tracking-tight leading-tight">Welcome, Guest</h2>
                <p className="text-[13px] text-[#5C4033] mt-1 mb-2">Har Bite Mein Happiness</p>
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/login" className="inline-block text-[11px] font-bold text-white bg-[#3B1F0A] px-4 py-2 rounded-lg uppercase tracking-widest mt-1 hover:bg-[#C17839] transition-colors">Login / Sign Up</Link>
              </>
            )}
          </div>

          {/* Links Section */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {[
              { name: 'HOME', icon: Home, href: '/' },
              { name: 'OUR MENU', icon: UtensilsCrossed, href: '/menu' },
              { name: 'ORDERS', icon: Receipt, href: '/account/orders' },
              { name: 'FAVORITES', icon: Heart, href: '/account/favorites' },
              { name: 'ABOUT US', icon: Info, href: '/about' },
            ].map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-5 px-5 py-4 rounded-xl transition-colors ${
                    isActive ? 'bg-[#EBE0D2] text-[#3B1F0A]' : 'text-[#3B1F0A] hover:bg-[#F5E6CC]'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#3B1F0A]' : 'text-[#6D4C3A]'} />
                  <span className="font-bold text-[13px] tracking-[0.15em]">{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer Section */}
          <div className="p-8 border-t border-[#EADDCE] bg-[#FDF6EC] pb-safe">
            {user && (
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                disabled={isLoggingOut}
                className="w-full text-left mb-8 text-[11px] font-black text-red-700/70 hover:text-red-700 uppercase tracking-widest"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            )}
            <p className="text-[11px] font-black text-[#6D4C3A] uppercase tracking-[0.1em] mb-4">Follow our journey</p>
            <div className="flex gap-5">
              <button aria-label="Share" className="text-[#3B1F0A] hover:text-[#C17839] transition-colors">
                <Share2 size={24} strokeWidth={2} />
              </button>
              <button aria-label="Email" className="text-[#3B1F0A] hover:text-[#C17839] transition-colors">
                <Mail size={24} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

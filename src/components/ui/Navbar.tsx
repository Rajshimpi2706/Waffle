'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User, ArrowRight } from 'lucide-react';
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

              {/* MOBILE: Always-visible Login / Account button */}
              {user ? (
                <Link
                  href="/account"
                  aria-label="My Account"
                  className="md:hidden relative p-2.5 text-[#3B1F0A] bg-[#FDF6EC] hover:bg-[#C17839] hover:text-white rounded-xl transition-all duration-300 flex items-center gap-1.5 justify-center min-h-[44px] px-3 active:scale-95"
                >
                  <User size={18} strokeWidth={2} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  aria-label="Login"
                  className="md:hidden relative px-4 py-2 bg-[#3B1F0A] text-white hover:bg-[#C17839] rounded-xl transition-all duration-300 flex items-center gap-1.5 justify-center min-h-[44px] font-black text-[10px] uppercase tracking-widest active:scale-95"
                >
                  <User size={16} strokeWidth={2.5} />
                  <span>Login</span>
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

      {/* Mobile Menu Overlay Architecture */}
      <div
        className={`fixed inset-0 z-40 bg-white/98 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] md:hidden flex flex-col ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Spacer for fixed header */}
        <div className="h-16" />

        <div className="flex-1 flex flex-col overflow-y-auto px-6 sm:px-10 pt-8 pb-6">
          {/* Nav Links */}
          <div className="space-y-1 mb-8">
            <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] opacity-40 mb-6">Main Menu</p>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-3xl sm:text-4xl font-serif font-black tracking-tighter transition-all duration-300 flex items-center justify-between group py-2 border-b border-[#F5E6CC]/60 ${pathname === link.href ? 'text-[#C17839]' : 'text-[#3B1F0A]'
                    }`}
                  style={{ transitionDelay: `${idx * 60}ms` }}
                >
                  {link.name}
                  <ArrowRight size={22} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#C17839]" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Account Section in Mobile Menu — belt-and-suspenders login visibility */}
          <div className="mt-auto space-y-4">
            <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-[0.4em] opacity-40">Account</p>
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/account"
                  className="flex items-center justify-between w-full px-6 py-4 bg-[#FDF6EC] rounded-2xl text-[#3B1F0A] font-bold text-sm uppercase tracking-widest border border-[#F5E6CC] active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} />
                    My Account
                  </div>
                  <ArrowRight size={16} className="text-[#C17839]" />
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full px-6 py-4 rounded-2xl text-red-500 font-bold text-sm uppercase tracking-widest border border-red-100 bg-red-50 active:scale-95 transition-all min-h-[52px]"
                >
                  {isLoggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-[#3B1F0A] rounded-2xl text-white font-bold text-sm uppercase tracking-widest active:scale-95 transition-all min-h-[52px]"
              >
                <User size={18} />
                Login / Sign Up
              </Link>
            )}

            {/* Cart CTA */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.dispatchEvent(new CustomEvent('open-cart'));
              }}
              className="flex items-center justify-between w-full px-6 py-4 bg-[#C17839] rounded-2xl text-white active:scale-95 transition-all min-h-[52px]"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} />
                <span className="font-bold text-sm uppercase tracking-widest">View Cart</span>
              </div>
              {cartItemCount > 0 && (
                <span className="bg-white/25 px-3 py-1 rounded-full text-xs font-black">{cartItemCount} ITEMS</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

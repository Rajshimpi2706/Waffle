'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { createClient } from '@/lib/supabase/client';
import { Button } from './Button';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
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
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex flex-col z-50">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#3B1F0A]">
                Waffle <span className="text-[#C17839]">Wala</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B5E3C] font-bold -mt-1 leading-none">
                Har Bite Mein Happiness
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-[#C17839] ${
                    pathname === link.href ? 'text-[#C17839]' : 'text-[#8B5E3C]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4 z-50">
              {/* Auth disabled for Phase 1 */}

              {/* Cart Toggle */}
              <button 
                onClick={() => document.dispatchEvent(new CustomEvent('open-cart'))}
                className="relative p-2 text-[#3B1F0A] hover:text-[#C17839] transition-colors flex items-center min-h-[44px] min-w-[44px] justify-center"
              >
                <ShoppingBag size={24} strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-0 w-5 h-5 bg-[#C17839] text-white text-[10px] font-bold rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1 shadow-sm">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 text-[#3B1F0A] min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-white pt-24 px-6 md:hidden animate-fade-in flex flex-col">
          <nav className="flex flex-col gap-6 text-xl font-serif">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`py-2 border-b border-[#F0E0C8] ${
                  pathname === link.href ? 'text-[#C17839] font-bold' : 'text-[#3B1F0A]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
               <Link href="/account" className="py-2 border-b border-[#F0E0C8] text-[#3B1F0A]">My Account</Link>
            ) : (
               <Link href="/login" className="py-2 border-b border-[#F0E0C8] text-[#3B1F0A]">Log In / Sign Up</Link>
            )}
          </nav>
          
          <div className="mt-auto pb-12">
             <Link href="/checkout" className="block w-full">
               <Button variant="primary" size="lg" className="w-full justify-between px-6">
                 View Cart
                 <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cartItemCount} items</span>
               </Button>
             </Link>
          </div>
        </div>
      )}
    </>
  );
}

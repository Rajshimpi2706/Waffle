import Link from 'next/link';
import { Globe, Camera, X } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#3B1F0A] text-[#FDF6EC] pt-16 pb-8 border-t-[8px] border-[#C17839]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-3xl font-bold tracking-tight text-white">
                Waffle <span className="text-[#C17839]">Wala</span>
              </span>
            </Link>
            <p className="text-[#C4A882] text-sm leading-relaxed mb-6">
              "Har Bite Mein Happiness" - Serving the finest Premium waffles with premium ingredients and a whole lot of love.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-[#C17839] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Camera size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-[#C17839] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <Globe size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-[#C17839] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={20} />
                <span className="sr-only">X (formerly Twitter)</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-[#E8A535]">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[#C4A882] hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/menu" className="text-[#C4A882] hover:text-white transition-colors">Our Menu</Link></li>
              <li><Link href="/about" className="text-[#C4A882] hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-[#C4A882] hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-[#E8A535]">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-[#C4A882] hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="text-[#C4A882] hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="text-[#C4A882] hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/delivery-zones" className="text-[#C4A882] hover:text-white transition-colors">Delivery Zones</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-4 text-[#E8A535]">Visit Us</h4>
            <address className="not-italic text-[#C4A882] text-sm space-y-2 mb-4">
              <p>42, Main Street, Koramangala<br />Bengaluru, Karnataka 560034</p>
              <p className="pt-2">Open Daily: 10:00 AM - 11:00 PM</p>
            </address>
            <div className="text-[#C4A882] text-sm space-y-1">
              <p>Call: <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a></p>
              <p>Email: <a href="mailto:hello@wafflewala.in" className="hover:text-white transition-colors">hello@wafflewala.in</a></p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#C4A882]">
          <p>&copy; {year} Waffle Wala. All rights reserved.</p>
          <p>Handcrafted with ❤️ for waffle lovers.</p>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDF6EC]">
      {/* Header Section */}
      <section className="relative py-24 bg-[#3B1F0A] overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(193,120,57,0.15)_0%,transparent_70%)]" />
        <div className="safe-container relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-black text-white mb-6">
            Contact <span className="text-[#C17839]">Us.</span>
          </h1>
          <p className="text-[#FDF6EC]/70 max-w-2xl mx-auto text-lg italic leading-relaxed">
            "Have a question, feedback, or a special request? We'd love to hear from you."
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-white">
        <div className="safe-container">
          <div className="grid lg:grid-cols-2 gap-20">
            
            {/* Contact Details Side */}
            <div className="flex flex-col gap-12">
              <div className="bg-[#FDF6EC] p-10 rounded-[3rem] border border-[#F5E6CC] shadow-soft">
                <h2 className="text-3xl font-serif font-black text-[#3B1F0A] mb-8">Visit Us</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-5">
                    <div className="p-3 bg-white rounded-2xl text-[#C17839] shadow-sm"><MapPin size={24} /></div>
                    <div>
                      <p className="font-bold text-[#3B1F0A] mb-1">Our Location</p>
                      <p className="text-[#8B5E3C] leading-relaxed">
                        42, Main Street, Koramangala<br />
                        Bengaluru, Karnataka 560034
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="p-3 bg-white rounded-2xl text-[#C17839] shadow-sm"><Clock size={24} /></div>
                    <div>
                      <p className="font-bold text-[#3B1F0A] mb-1">Opening Hours</p>
                      <p className="text-[#8B5E3C]">Open Daily: 10:00 AM - 11:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="p-3 bg-white rounded-2xl text-[#C17839] shadow-sm"><Phone size={24} /></div>
                    <div>
                      <p className="font-bold text-[#3B1F0A] mb-1">Call Us</p>
                      <a href="tel:+919876543210" className="text-[#C17839] hover:underline">+91 98765 43210</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-5">
                    <div className="p-3 bg-white rounded-2xl text-[#C17839] shadow-sm"><Mail size={24} /></div>
                    <div>
                      <p className="font-bold text-[#3B1F0A] mb-1">Email Us</p>
                      <a href="mailto:hello@wafflewala.in" className="text-[#C17839] hover:underline">hello@wafflewala.in</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Side */}
            <div className="flex flex-col gap-8">
              <h2 className="text-3xl font-serif font-black text-[#3B1F0A]">Send us a message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3B1F0A] uppercase tracking-widest pl-2">First Name</label>
                    <Input placeholder="John" className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3B1F0A] uppercase tracking-widest pl-2">Last Name</label>
                    <Input placeholder="Doe" className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#3B1F0A] uppercase tracking-widest pl-2">Email Address</label>
                  <Input type="email" placeholder="john@example.com" className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#3B1F0A] uppercase tracking-widest pl-2">Message</label>
                  <textarea 
                    placeholder="Tell us what's on your mind..." 
                    className="w-full min-h-[160px] p-6 rounded-[2rem] border border-[#F5E6CC] bg-[#FDF6EC]/30 text-[#3B1F0A] focus:outline-none focus:ring-2 focus:ring-[#C17839] transition-all"
                  />
                </div>
                <Button size="xl" className="w-full h-16 rounded-3xl bg-[#3B1F0A] text-white flex items-center justify-center gap-3">
                  Send Message <Send size={20} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

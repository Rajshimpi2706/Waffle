import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  const url = `https://wa.me/${number}?text=${encodeURIComponent("Hi! I need help with my Waffle House order.")}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-3 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#1EBE53] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center min-h-[56px] min-w-[56px] animate-fade-in"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
}

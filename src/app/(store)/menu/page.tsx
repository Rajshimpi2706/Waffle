import { MenuClient } from './MenuClient';
import { PRODUCTS, CATEGORIES } from '@/data/products';

export const metadata = {
  title: 'Our Delicious Menu | Waffle Wala',
  description: 'Explore our premium range of Classic, Chocolate, and Premium Belgian Waffles. Har Bite Mein Happiness!',
};

export default function MenuPage() {
  return (
    <div className="bg-[#FDF6EC] min-h-screen py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in shadow-sm p-8 bg-white rounded-3xl border border-[#F5E6CC]">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3B1F0A] mb-4 italic">Our Delicious Menu</h1>
          <div className="w-16 h-1 bg-[#C17839] mx-auto rounded-full mb-4" />
          <p className="text-[#8B5E3C] text-lg font-medium">
            "Har Bite Mein Happiness"
          </p>
          <p className="text-[#8B5E3C]/80 mt-2 text-sm">
            Freshly baked, 100% vegetarian Belgian waffles made with love and premium chocolate.
          </p>
        </div>

        <MenuClient 
          initialCategories={CATEGORIES} 
          initialProducts={PRODUCTS} 
        />
      </div>
    </div>
  );
}

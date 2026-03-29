'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/lib/cart';
import { toast } from 'sonner';
import type { Category, Product } from '@/types';

interface MenuClientProps {
  initialCategories: Category[];
  initialProducts: any[]; // Extended product with nested relations
}

export function MenuClient({ initialCategories, initialProducts }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Derive categories from products if not provided
  const categories = useMemo(() => {
    if (initialCategories.length > 0) return initialCategories;
    
    const uniqueCats = new Map();
    initialProducts.forEach((p: any) => {
      // Handle both table-name (plural) and alias (singular) joins
      const catData = p.category || p.categories;
      
      // Supabase can return as an object or a single-item array
      const cat = Array.isArray(catData) ? catData[0] : catData;
      
      if (cat && cat.id) {
        uniqueCats.set(cat.id, cat);
      }
    });
    return Array.from(uniqueCats.values()) as Category[];
  }, [initialCategories, initialProducts]);

  const addItem = useCartStore((state) => state.addItem);

  // Filter and sort logic
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Category Filter
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category_id === activeCategory);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'featured':
        default:
          return (a.sort_order || 0) - (b.sort_order || 0) || (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });

    return result;
  }, [initialProducts, activeCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    // If no variants/toppings, add directly. Otherwise, user should use the customize button (handled in UI via disabled routing)
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price, // Using the new price property
      toppings: []
    });
    toast.success(`${product.name} added to cart!`, {
      action: {
        label: 'View Cart',
        onClick: () => window.location.href = '/checkout',
      },
    });
  };

  const handleCustomize = (product: Product) => {
    // This will open a modal or route to the product detail page depending on our implementation.
    // For now, let's route to the product detail page.
    window.location.href = `/menu/${product.slug}`;
  };

  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:items-start animate-fade-in pb-24" style={{ animationDelay: '200ms' }}>
      {/* Sidebar Architecture */}
      <aside className="lg:w-72 flex-shrink-0 flex flex-col gap-8 lg:sticky lg:top-28">
        
        {/* Premium Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#C17839] group-focus-within:scale-110 transition-transform duration-300">
            <Search size={20} />
          </div>
          <Input
            type="search"
            placeholder="Search your favorite..."
            className="pl-14 h-14 rounded-2xl bg-white border-[#F5E6CC] shadow-soft focus:shadow-premium focus:ring-[#C17839] transition-all placeholder:italic text-[#3B1F0A] font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories (Desktop) */}
        <div className="hidden lg:block bg-white p-8 rounded-[2rem] shadow-soft border border-[#F5E6CC] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C17839]/10 to-transparent" />
          
          <h3 className="font-serif font-black text-xl text-[#3B1F0A] mb-6 flex items-center gap-3">
            <SlidersHorizontal size={20} className="text-[#C17839]" /> 
            Waffle Types
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === 'all'
                    ? 'bg-[#3B1F0A] text-white shadow-lg translate-x-1'
                    : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A] hover:translate-x-1'
                }`}
              >
                All Flavors
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-[#3B1F0A] text-white shadow-lg translate-x-1'
                      : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A] hover:translate-x-1'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sort Architecture */}
        <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-[#F5E6CC]">
          <h3 className="font-serif font-black text-xl text-[#3B1F0A] mb-6 flex items-center gap-3">
            <ArrowUpDown size={20} className="text-[#C17839]" /> Order By
          </h3>
          <Select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border-[#F5E6CC] bg-[#FDF6EC]/50 font-bold text-[#3B1F0A]"
          >
            <option value="featured">Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Alphabetical</option>
          </Select>
        </div>

        {/* Small Trust Micro-strip */}
        <div className="mt-4 p-6 bg-[#3B1F0A]/5 rounded-2xl border border-dashed border-[#C17839]/20 flex flex-col gap-4">
           <div className="flex items-center gap-3 text-[#3B1F0A] text-[10px] font-black uppercase tracking-widest italic">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C17839]" />
              Fresh Batches Daily
           </div>
           <div className="flex items-center gap-3 text-[#3B1F0A] text-[10px] font-black uppercase tracking-widest italic">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C17839]" />
              Safe & Hygienic
           </div>
        </div>
      </aside>

      {/* Categories Mobile Horizontal Scroll */}
      <div className="flex lg:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide gap-3 mb-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-soft ${
              activeCategory === 'all'
                ? 'bg-[#3B1F0A] text-white shadow-lg scale-105'
                : 'bg-white border border-[#F5E6CC] text-[#8B5E3C]'
            }`}
          >
            All flavors
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-soft ${
                activeCategory === cat.id
                  ? 'bg-[#3B1F0A] text-white shadow-lg scale-105'
                  : 'bg-white border border-[#F5E6CC] text-[#8B5E3C]'
              }`}
            >
              {cat.name}
            </button>
          ))}
      </div>

      {/* Product Display Canvas */}
      <main className="flex-1">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 shadow-soft border border-[#F5E6CC] flex flex-col items-center text-center animate-fade-in">
             <div className="w-24 h-24 rounded-[2rem] bg-[#FDF6EC] flex items-center justify-center text-[#F5E6CC] mb-8">
                <Search size={48} />
             </div>
             <h3 className="text-3xl font-serif font-black text-[#3B1F0A] mb-4">No Waffles Matches</h3>
             <p className="text-[#8B5E3C] max-w-sm font-medium italic mb-10 opacity-70">
               "We couldn't find any waffles matching your current craving. Try adjusting your filters!"
             </p>
             <Button 
               size="xl"
               onClick={() => {
                 setSearchQuery('');
                 setActiveCategory('all');
               }}
               className="rounded-full bg-[#3B1F0A] hover:bg-black text-white px-10 shadow-lg active:scale-95"
             >
               Show All Waffles
             </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product, idx) => (
              <div 
                key={product.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${(idx % 6) * 50}ms` }}
              >
                <ProductCard
                  product={product as any}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

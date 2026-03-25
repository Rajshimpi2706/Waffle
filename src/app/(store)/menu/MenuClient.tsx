'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
          return a.base_price - b.base_price;
        case 'price-high':
          return b.base_price - a.base_price;
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
      unitPrice: product.base_price, // Assuming base price is final if no variants
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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start animate-fade-in" style={{ animationDelay: '100ms' }}>
      {/* Sidebar Filters */}
      <aside className="lg:w-64 flex-shrink-0 flex flex-col gap-6 lg:sticky lg:top-24">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8B5E3C]">
            <Search size={18} />
          </div>
          <Input
            type="search"
            placeholder="Search waffles..."
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories (Desktop) */}
        <div className="hidden lg:block bg-white p-5 rounded-2xl shadow-sm border border-[#F5E6CC]">
          <h3 className="font-serif font-semibold text-lg text-[#3B1F0A] mb-4 flex items-center gap-2">
            <SlidersHorizontal size={18} /> Categories
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-[#C17839] text-white font-medium'
                    : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A]'
                }`}
              >
                All Full Menu
              </button>
            </li>
            {initialCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-[#C17839] text-white font-medium'
                      : 'text-[#8B5E3C] hover:bg-[#FDF6EC] hover:text-[#3B1F0A]'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Mobile Horizontal Scroll */}
        <div className="flex lg:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide gap-2">
           <button
             onClick={() => setActiveCategory('all')}
             className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
               activeCategory === 'all'
                 ? 'bg-[#3B1F0A] text-white'
                 : 'bg-white border border-[#E5D5C0] text-[#8B5E3C]'
             }`}
           >
             All
           </button>
           {initialCategories.map((cat) => (
             <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                 activeCategory === cat.id
                   ? 'bg-[#3B1F0A] text-white'
                   : 'bg-white border border-[#E5D5C0] text-[#8B5E3C]'
               }`}
             >
               {cat.name}
             </button>
           ))}
        </div>

        {/* Sort */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#F5E6CC]">
          <h3 className="font-serif font-semibold text-lg text-[#3B1F0A] mb-4 flex items-center gap-2">
            <ArrowUpDown size={18} /> Sort By
          </h3>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">Featured / Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </Select>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="flex-1">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No waffles found"
            description="We couldn't find any items matching your current filters. Try adjusting your search or category."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product as any}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

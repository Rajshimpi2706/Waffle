'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  Filter,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { Category, Product, AdminRole } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface ProductsClientProps {
  initialProducts: any[];
  categories: any[];
  adminRole: AdminRole;
}

export function ProductsClient({ initialProducts, categories, adminRole }: ProductsClientProps) {
  // State
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: 0,
    category_id: '',
    description: '',
    image_url: '',
    is_available: true
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      slug: '', 
      price: 0, 
      category_id: categories[0]?.id || '', 
      description: '', 
      image_url: '', 
      is_available: true 
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      category_id: product.category_id || '',
      description: product.description || '',
      image_url: product.image_url || '',
      is_available: product.is_available
    });
    setIsModalOpen(true);
  };

  const handleToggleAvailability = async (product: any) => {
    try {
      const newStatus = !product.is_available;
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update availability');
      
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: newStatus } : p));
      toast.success(`${product.name} is now ${newStatus ? 'on' : 'off'} the menu`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = editingProduct ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === data.product.id ? { ...p, ...data.product, category: categories.find(c => c.id === data.product.category_id) } : p));
        toast.success('Product updated successfully');
      } else {
        const newProduct = { ...data.product, category: categories.find(c => c.id === data.product.category_id) };
        setProducts(prev => [newProduct, ...prev]);
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? Items with sales history will be archived instead.')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      
      if (data.message && data.message.includes('archived')) {
        toast.info(data.message);
        // Refresh full list from server or update locally
        setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: false, name: `[ARCHIVED] ${p.name}` } : p));
      } else {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Product removed from system');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 animate-fade-in text-[#3B1F0A] pb-20">
      
      {/* Premium Search & Actions Architecture */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-6 lg:p-8 rounded-[2.5rem] border border-[#F5E6CC] shadow-soft relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C17839]/10" />
        
        <div className="flex flex-col sm:flex-row flex-1 gap-4 w-full">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C17839] group-focus-within:scale-110 transition-transform" size={18} />
            <Input 
              placeholder="Search inventory..." 
              className="pl-12 h-14 bg-[#FDF6EC]/30 border-[#F5E6CC] rounded-2xl focus:shadow-premium transition-all font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-60 ml-2 whitespace-nowrap">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-14 px-6 rounded-2xl border border-[#F5E6CC] bg-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#C17839]/20 shadow-soft transition-all"
            >
              <option value="all">Full Catalog</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        {['owner', 'manager'].includes(adminRole) && (
          <Button 
            onClick={() => { resetForm(); setIsModalOpen(true); }} 
            className="bg-[#3B1F0A] hover:bg-black text-white flex gap-3 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:shadow-xl transition-all active:scale-95 w-full lg:w-auto"
          >
            <Plus size={18} /> New Waffle
          </Button>
        )}
      </div>

      {/* Product Grid Architecture */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border border-[#F5E6CC] text-center shadow-soft animate-fade-in">
           <div className="w-24 h-24 bg-[#FDF6EC] rounded-[2.5rem] flex items-center justify-center text-[#F5E6CC] mx-auto mb-8">
              <AlertCircle size={56} />
           </div>
           <p className="text-2xl font-serif font-black text-[#3B1F0A]">Inventory Emptied</p>
           <p className="text-[#8B5E3C] mt-2 font-medium italic opacity-60">"Your search didn't yield any sweet results."</p>
           <Button variant="ghost" className="mt-8 text-[#C17839] font-black uppercase tracking-widest text-[10px]" onClick={() => {setSearchQuery(''); setCategoryFilter('all');}}>
              Reset All Filters
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className={cn(
               "bg-white rounded-[2.5rem] border border-[#F5E6CC] shadow-soft overflow-hidden flex flex-col transition-all duration-500 hover:shadow-premium group",
               !product.is_available && "opacity-60 grayscale-[0.5]"
            )}>
              <div className="aspect-[4/3] relative bg-[#FDF6EC] overflow-hidden">
                 {product.image_url ? (
                   <img 
                     src={product.image_url} 
                     alt={product.name}
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-[#F5E6CC]">
                      <ImageIcon size={64} />
                   </div>
                 )}
                 <div className="absolute top-4 right-4">
                    <Badge variant={product.is_available ? 'success' : 'secondary'} className="uppercase text-[9px] font-black tracking-[0.2em] rounded-full px-4 py-1.5 border shadow-lg bg-white/90 backdrop-blur-sm">
                      {product.is_available ? 'Live' : 'Hidden'}
                    </Badge>
                 </div>
                 {!product.is_available && (
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                       <div className="bg-white/95 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-red-500 border border-red-100 shadow-xl">Offline</div>
                    </div>
                 )}
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                     <h3 className="text-xl font-serif font-black text-[#3B1F0A] truncate tracking-tight">{product.name}</h3>
                     <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest mt-1 opacity-60">
                       {product.category?.name || categories.find(c => c.id === product.category_id)?.name || 'Legacy Catalog'}
                     </p>
                  </div>
                  <p className="font-serif font-black text-[#C17839] text-xl">{formatCurrency(product.price)}</p>
                </div>
                
                <p className="text-[#8B5E3C] text-xs font-medium leading-relaxed line-clamp-2 mb-8 h-8 opacity-80">
                  {product.description || 'No specialized description provided for this culinary creation.'}
                </p>

                <div className="mt-auto pt-6 border-t border-[#FDF6EC] flex items-center justify-between">
                   <button 
                     onClick={() => handleToggleAvailability(product)}
                     className={cn(
                        "text-[9px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl border border-transparent active:scale-95",
                        product.is_available ? "bg-[#FDF6EC] text-[#8B5E3C] hover:text-red-600 hover:border-red-100" : "bg-[#C17839]/10 text-[#C17839] hover:bg-[#C17839]/20"
                     )}
                   >
                     {product.is_available ? 'Take Offline' : 'Publish Live'}
                   </button>

                   <div className="flex gap-2">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(product)} 
                        className="w-10 h-10 rounded-xl bg-white border border-[#F5E6CC] text-[#3B1F0A] hover:bg-[#FDF6EC] hover:shadow-soft transition-all"
                     >
                       <Edit3 size={16} />
                     </Button>
                     {adminRole === 'owner' && (
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(product.id)} 
                          className="w-10 h-10 rounded-xl bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:shadow-soft transition-all"
                       >
                         <Trash2 size={16} />
                       </Button>
                     )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal Architecture */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? 'Refine Selection' : 'Forge New Waffle'}
        size="lg"
      >
        <div className="p-2">
           <div className="mb-8">
              <p className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest opacity-60">Global Inventory Hub</p>
              <h4 className="text-3xl font-serif font-black text-[#3B1F0A] tracking-tighter mt-1">
                 {editingProduct ? 'Update Parameters' : 'Register New Item'}
              </h4>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Waffle Designation</label>
                  <Input 
                    placeholder="e.g. Belgian Truffle Noir" 
                    className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30 font-bold focus:shadow-premium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Protocol Slug</label>
                  <Input 
                    placeholder="e.g. belgian-truffle-noir" 
                    className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30 font-bold focus:shadow-premium"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    required
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Premium Valuation (₹)</label>
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30 font-bold focus:shadow-premium"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Menu Category</label>
                  <select 
                    className="w-full h-14 px-6 rounded-2xl border border-[#F5E6CC] bg-[#FDF6EC]/30 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#C17839]/20"
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    required
                  >
                    <option value="" disabled>Select Segment</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Culinary Narrative</label>
                <textarea 
                  className="w-full rounded-2xl border border-[#F5E6CC] bg-[#FDF6EC]/30 p-6 text-sm font-medium focus:ring-2 focus:ring-[#C17839]/20 outline-none min-h-[120px] resize-none"
                  placeholder="Describe the sensory experience..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-[#A17C5F] uppercase tracking-widest">Image Asset Source</label>
                <Input 
                  placeholder="CDN or External URL" 
                  className="h-14 rounded-2xl border-[#F5E6CC] bg-[#FDF6EC]/30 font-bold focus:shadow-premium"
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                />
                <p className="text-[9px] text-[#A17C5F] font-bold italic mt-2 opacity-60">High-resolution assets recommended for the 3D Hero Carousel.</p>
             </div>

             <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-[#FDF6EC]">
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8">Discard</Button>
                <Button type="submit" className="h-14 rounded-2xl bg-[#3B1F0A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] px-12 shadow-lg hover:shadow-xl transition-all active:scale-95">
                   {editingProduct ? 'Finalize Changes' : 'Commit to Catalog'}
                </Button>
             </div>
           </form>
        </div>
      </Modal>

    </div>
  );
}

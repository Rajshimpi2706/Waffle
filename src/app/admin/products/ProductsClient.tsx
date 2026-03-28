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
import { formatCurrency } from '@/lib/utils';
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
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-1 gap-2 w-full">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search products..." 
              className="pl-10 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 hidden sm:block" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-1 focus:ring-[#C17839]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        {['owner', 'manager'].includes(adminRole) && (
          <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-[#C17839] hover:bg-[#A6662E] flex gap-2 h-10 text-white w-full sm:w-auto">
            <Plus size={18} /> Add Product
          </Button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400">
           <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
           <p>No products found matching your search and category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md ${!product.is_available && 'opacity-60 bg-gray-50'}`}>
              <div className="aspect-video relative bg-gray-100 overflow-hidden">
                 {product.image_url ? (
                   <img 
                     src={product.image_url} 
                     alt={product.name}
                     className="w-full h-full object-cover"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={48} />
                   </div>
                 )}
                 <div className="absolute top-3 right-3">
                    <Badge variant={product.is_available ? 'success' : 'secondary'} className="uppercase text-[9px] font-bold tracking-wider">
                      {product.is_available ? 'Active' : 'Hidden'}
                    </Badge>
                 </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                     <h3 className="font-bold text-gray-900 truncate" title={product.name}>{product.name}</h3>
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                       {product.category?.name || categories.find(c => c.id === product.category_id)?.name || 'Uncategorized'}
                     </span>
                  </div>
                  <p className="font-bold text-[#C17839] whitespace-nowrap">{formatCurrency(product.price)}</p>
                </div>
                
                <p className="text-gray-500 text-xs line-clamp-2 mb-6 min-h-[32px]">
                  {product.description || 'No description provided for this item.'}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                   <button 
                     onClick={() => handleToggleAvailability(product)}
                     className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                        product.is_available ? 'text-gray-400 hover:text-red-500' : 'text-[#C17839] hover:text-[#A6662E]'
                     }`}
                   >
                     {product.is_available ? 'Disable Item' : 'Enable Item'}
                   </button>

                   <div className="flex gap-2">
                     <Button variant="outline" size="icon" onClick={() => handleEdit(product)} className="w-8 h-8 rounded-full border-gray-200">
                       <Edit3 size={14} className="text-gray-600" />
                     </Button>
                     {adminRole === 'owner' && (
                       <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-full border-gray-200 hover:bg-red-50 hover:border-red-100">
                         <Trash2 size={14} className="text-red-500" />
                       </Button>
                     )}
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? 'Edit Product' : 'Add New Waffle'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="p-1 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Product Name</label>
               <Input 
                 placeholder="e.g. Nutella Blast" 
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 required
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">URL Slug</label>
               <Input 
                 placeholder="e.g. nutella-blast" 
                 value={formData.slug}
                 onChange={e => setFormData({...formData, slug: e.target.value})}
                 required
               />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Base Price (₹)</label>
               <Input 
                 type="number"
                 placeholder="0" 
                 value={formData.price}
                 onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                 required
               />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Category</label>
               <select 
                 className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-1 focus:ring-[#C17839]"
                 value={formData.category_id}
                 onChange={e => setFormData({...formData, category_id: e.target.value})}
                 required
               >
                 <option value="" disabled>Select a category</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Description</label>
             <textarea 
               className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-1 focus:ring-[#C17839] outline-none min-h-[100px] resize-none"
               placeholder="Briefly describe the product, ingredients, etc."
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
             />
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Image URL</label>
             <Input 
               placeholder="Paste image link here" 
               value={formData.image_url}
               onChange={e => setFormData({...formData, image_url: e.target.value})}
             />
             <p className="text-[10px] text-gray-400 italic">Recommendation: 1200x800px or 3:2 aspect ratio.</p>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
             <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit" className="bg-[#C17839] hover:bg-[#A6662E] text-white px-8">
                {editingProduct ? 'Save Changes' : 'Create Product'}
             </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

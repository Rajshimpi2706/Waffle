'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ShieldAlert, Archive } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/app/admin/products/ProductForm';
import { createClient } from '@/lib/supabase/client';
import type { Product, Category, ToppingAddon, AdminRole } from '@/types';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  toppings: ToppingAddon[];
  adminRole: AdminRole;
}

export function ProductsClient({ initialProducts, categories, toppings, adminRole }: ProductsClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product: any) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleToggleAvailability = async (product: any) => {
    try {
      const supabase = createClient();
      const newStatus = !product.is_available;
      
      const { error } = await supabase
        .from('products')
        .update({ is_available: newStatus })
        .eq('id', product.id);

      if (error) throw error;
      
      setProducts((prev: any) => prev.map((p: any) => p.id === product.id ? { ...p, is_available: newStatus } : p));
      toast.success(`${product.name} marked as ${newStatus ? 'available' : 'unavailable'}`);

      // Optional: Hit a small local API endpoint to add an audit log for this quick toggle
      fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'update',
          entity_type: 'product_availability',
          entity_id: product.id,
          new_value: { is_available: newStatus }
        })
      });

    } catch (err: any) {
      toast.error('Failed to update availability');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      
      setProducts((prev: any) => prev.filter((p: any) => p.id !== productToDelete.id));
      setIsDeleteOpen(false);
      setProductToDelete(null);
      toast.success('Product deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
      
      {/* Controls */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <Input 
             placeholder="Search products or categories..." 
             className="pl-10"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white">
          <Plus size={16} /> Add Product
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-sm text-left align-middle">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category / Type</th>
              <th className="px-6 py-4 font-medium text-right">Unit Price</th>
              <th className="px-6 py-4 font-medium text-center">Status / Stock</th>
              <th className="px-6 py-4 font-medium text-right w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Archive size={32} className="mx-auto text-gray-300 mb-3" />
                  <p>No products found.</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">No Img</div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate w-48" title={product.description}>{product.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-gray-900 font-medium">{product.category?.name || 'Uncategorized'}</p>
                    <div className="flex items-center gap-2 mt-1">
                       {product.is_vegetarian ? (
                         <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 rounded border border-green-200 shrink-0">Veg</span>
                       ) : (
                         <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 rounded border border-red-200 shrink-0">Non-Veg</span>
                       )}
                       {product.is_featured && <span className="text-[10px] font-semibold text-[#8B5E3C] bg-[#F5E6CC] px-2 rounded shrink-0">Featured</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button 
                         onClick={() => handleToggleAvailability(product)}
                         className={`px-3 py-1 text-xs font-semibold rounded-full w-24 transition-colors ${
                           product.is_available 
                             ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200' 
                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                         }`}
                      >
                         {product.is_available ? 'Available' : 'Hidden'}
                      </button>
                      
                      {(!product.is_available) && (
                         <Badge variant="destructive" className="text-[10px] uppercase scale-90">Sold Out</Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleOpenEdit(product)}
                         className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                         title="Edit Product"
                       >
                         <Edit2 size={16} />
                       </button>
                       {adminRole === 'owner' && (
                         <button 
                           onClick={() => handleOpenDelete(product)}
                           className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="Delete Product"
                         >
                           <Trash2 size={16} />
                         </button>
                       )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedProduct ? "Edit Product" : "Add New Product"} size="xl">
        <ProductForm 
           product={selectedProduct} 
           categories={categories}
           toppings={toppings}
           onSuccess={(savedProduct: Product) => {
             setIsFormOpen(false);
             if (selectedProduct) {
               setProducts((prev) => prev.map((p) => p.id === savedProduct.id ? savedProduct : p));
             } else {
               setProducts((prev) => [savedProduct, ...prev]);
             }
           }} 
        />
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Deletion">
        <div className="pt-2">
          <div className="bg-red-50 text-red-800 p-4 rounded-xl flex gap-3 mb-6 items-start">
             <ShieldAlert className="flex-shrink-0 mt-0.5" size={20} />
             <div>
               <p className="font-semibold text-sm">Destructive Action</p>
               <p className="text-xs mt-1">Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone and may affect historical order analytics if soft-deletes aren't implemented in the DB layer.</p>
             </div>
          </div>
          <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
             <Button variant="danger" onClick={handleDeleteConfirm} loading={isDeleting}>Delete Product</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

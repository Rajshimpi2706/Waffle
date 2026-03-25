import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { toast } from 'sonner';
import type { Product, Category, ToppingAddon } from '@/types';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  toppings: ToppingAddon[];
  onSuccess: (product: Product) => void;
}

export function ProductForm({ product, categories, toppings, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!product;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const payload: any = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        description: formData.get('description'),
        category_id: formData.get('category_id'),
        base_price: parseFloat(formData.get('base_price') as string),
        image_url: formData.get('image_url') || null,
        is_available: formData.get('is_available') === 'on',
        is_featured: formData.get('is_featured') === 'on',
        is_vegetarian: formData.get('is_vegetarian') === 'on',
        track_inventory: formData.get('track_inventory') === 'on',
        stock_quantity: formData.get('track_inventory') === 'on' ? parseInt(formData.get('stock_quantity') as string) : null,
      };

      if (isEditing) {
        payload.id = product.id;
      }

      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(isEditing ? 'Product updated' : 'Product created');
      onSuccess(data.product);

    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
           <Input name="name" required defaultValue={product?.name} placeholder="e.g. Classic Belgian" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
           <Input name="slug" required defaultValue={product?.slug} placeholder="classic-belgian" pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" title="Lowercase letters, numbers, and hyphens only" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <Textarea name="description" required defaultValue={product?.description} rows={2} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
           <Select name="category_id" required defaultValue={product?.category_id || ''}>
              <option value="">Select Category</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
           </Select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
           <Input type="number" step="0.01" name="base_price" required defaultValue={product?.base_price} min={0} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <Input name="image_url" defaultValue={product?.image_url || ''} placeholder="https://..." />
      </div>

      {/* Toggles */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 gap-4 grid grid-cols-2 sm:grid-cols-4">
         <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
           <input type="checkbox" name="is_available" defaultChecked={product ? product.is_available : true} className="rounded text-[#3B1F0A] focus:ring-[#3B1F0A] w-4 h-4" />
           Available
         </label>
         <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
           <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} className="rounded text-[#3B1F0A] focus:ring-[#3B1F0A] w-4 h-4" />
           Featured
         </label>
         <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
           <input type="checkbox" name="is_vegetarian" defaultChecked={product ? product.is_vegetarian : true} className="rounded text-green-600 focus:ring-green-600 w-4 h-4" />
           Vegetarian
         </label>
      </div>

      {/* Inventory Tracking section */}
      <div className="border border-gray-200 rounded-xl p-4">
         <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b border-gray-100 pb-2">Inventory Management</h4>
         <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                name="track_inventory" 
                defaultChecked={product?.track_inventory} 
                className="rounded text-[#3B1F0A] focus:ring-[#3B1F0A] w-4 h-4"
                onChange={(e) => {
                  const el = document.getElementById('stock_quantity_input') as HTMLInputElement;
                  if (el) {
                    el.disabled = !e.target.checked;
                    if (!e.target.checked) el.value = '';
                  }
                }}
              />
              Track Stock Levels
            </label>
            <div className="flex-1 flex items-center gap-2 w-full">
              <span className="text-sm text-gray-500 whitespace-nowrap hidden sm:inline">Current Stock:</span>
              <Input 
                 id="stock_quantity_input"
                 type="number" 
                 name="stock_quantity" 
                 defaultValue={product?.stock_quantity ?? ''} 
                 min={0}
                 disabled={!product?.track_inventory}
                 placeholder="0"
                 className="max-w-[120px]"
              />
            </div>
         </div>
         <p className="text-xs text-gray-500 mt-2 italic">
           When tracking is enabled, products with 0 stock will automatically be marked and enforced as "Sold Out" sitewide.
         </p>
      </div>

      <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 pb-2">
         <Button type="submit" loading={loading} className="bg-gray-900 hover:bg-gray-800 px-8">
           {isEditing ? 'Save Changes' : 'Create Product'}
         </Button>
      </div>
    </form>
  );
}

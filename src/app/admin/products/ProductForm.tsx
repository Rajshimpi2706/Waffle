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
        price: parseFloat(formData.get('price') as string),
        image_url: formData.get('image_url') || null,
        is_available: formData.get('is_available') === 'on',
        is_featured: formData.get('is_featured') === 'on',
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
           <label className="block text-sm font-medium text-gray-700 mb-1">Product Price (₹)</label>
           <Input type="number" step="0.01" name="price" required defaultValue={product?.price} min={0} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <Input name="image_url" defaultValue={product?.image_url || ''} placeholder="https://..." />
      </div>

      {/* Toggles */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 gap-4 grid grid-cols-2 sm:grid-cols-2">
         <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
           <input type="checkbox" name="is_available" defaultChecked={product ? product.is_available : true} className="rounded text-[#3B1F0A] focus:ring-[#3B1F0A] w-4 h-4" />
           Available for Order
         </label>
         <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
           <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} className="rounded text-[#3B1F0A] focus:ring-[#3B1F0A] w-4 h-4" />
           Feature on Menu
         </label>
      </div>

      {/* Helper text for the simplified form */}
      <p className="text-xs text-gray-500 mt-2 italic px-2">
        Pricing and basic availability are synchronized directly with your Supabase database.
      </p>

      <div className="flex justify-end pt-4 mt-6 border-t border-gray-100 pb-2">
         <Button type="submit" loading={loading} className="bg-gray-900 hover:bg-gray-800 px-8">
           {isEditing ? 'Save Changes' : 'Create Product'}
         </Button>
      </div>
    </form>
  );
}

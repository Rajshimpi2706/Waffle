import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Waffle',
    slug: 'classic-waffle',
    category_id: 'classic',
    category: { 
      id: 'classic', 
      name: 'Classic Waffles', 
      slug: 'classic', 
      sort_order: 1, 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    base_price: 89,
    description: 'Freshly baked golden waffle served warm with a light drizzle of chocolate syrup. Crispy outside, soft inside — perfect for a simple and satisfying treat.',
    image_url: '/images/products/classic-waffle.jpg',
    is_available: true,
    is_sold_out: false,
    is_featured: true,
    is_vegetarian: true,
    track_inventory: false,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Double Chocolate Delight',
    slug: 'double-chocolate-delight',
    category_id: 'chocolate',
    category: { 
      id: 'chocolate', 
      name: 'Chocolate Waffles', 
      slug: 'chocolate', 
      sort_order: 2, 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    base_price: 129,
    description: 'A rich waffle loaded with double layers of chocolate — smooth chocolate spread inside and melted chocolate drizzle on top. A must-have for true chocolate lovers.',
    image_url: '/images/products/double-chocolate-delight.jpg',
    is_available: true,
    is_sold_out: false,
    is_featured: true,
    is_vegetarian: true,
    track_inventory: false,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Triple Chocolate Blast',
    slug: 'triple-chocolate-blast',
    category_id: 'premium',
    category: { 
      id: 'premium', 
      name: 'Premium Specials', 
      slug: 'premium', 
      sort_order: 3, 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    base_price: 149,
    description: 'Indulge in a chocolate explosion with three layers of goodness — chocolate spread, chocolate chips, and a thick chocolate drizzle. Every bite is pure bliss.',
    image_url: '/images/products/triple-chocolate-blast.jpg',
    is_available: true,
    is_sold_out: false,
    is_featured: true,
    is_vegetarian: true,
    track_inventory: false,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Dark Chocolate Heaven',
    slug: 'dark-chocolate-heaven',
    category_id: 'premium',
    category: { 
      id: 'premium', 
      name: 'Premium Specials', 
      slug: 'premium', 
      sort_order: 3, 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    base_price: 139,
    description: 'Crafted for intense chocolate lovers, this waffle is topped with rich dark chocolate for a bold and slightly bitter-sweet flavor that feels premium and indulgent.',
    image_url: '/images/products/dark-chocolate-heaven.jpg',
    is_available: true,
    is_sold_out: false,
    is_featured: false,
    is_vegetarian: true,
    track_inventory: false,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Oreo Crunch',
    slug: 'oreo-crunch',
    category_id: 'premium',
    category: { 
      id: 'premium', 
      name: 'Premium Specials', 
      slug: 'premium', 
      sort_order: 3, 
      is_active: true, 
      created_at: new Date().toISOString() 
    },
    base_price: 149,
    description: 'Crispy waffle topped with crushed Oreo biscuits, creamy chocolate spread, and a smooth drizzle. A crunchy, creamy, and chocolatey delight in every bite.',
    image_url: '/images/products/oreo-crunch.jpg',
    is_available: true,
    is_sold_out: false,
    is_featured: false,
    is_vegetarian: true,
    track_inventory: false,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const CATEGORIES = [
  { 
    id: 'classic', 
    name: 'Classic Waffles', 
    slug: 'classic',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  { 
    id: 'chocolate', 
    name: 'Chocolate Waffles', 
    slug: 'chocolate',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  { 
    id: 'premium', 
    name: 'Premium Specials', 
    slug: 'premium',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

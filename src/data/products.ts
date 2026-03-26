import { Product, Category } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Waffle',
    slug: 'classic-waffle',
    category_id: 'classic-waffles',
    category: {
      id: 'classic-waffles',
      name: 'Classic Waffles',
      slug: 'classic-waffles',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    price: 89,
    description: 'Freshly baked golden waffle served warm with a light drizzle of chocolate syrup. Crispy outside, soft inside — perfect for a simple and satisfying treat.',
    image_url: '/images/products/classic-waffle.png',
    is_available: true,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Double Chocolate Delight',
    slug: 'double-chocolate-delight',
    category_id: 'chocolate-waffles',
    category: {
      id: 'chocolate-waffles',
      name: 'Chocolate Waffles',
      slug: 'chocolate-waffles',
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString()
    },
    price: 129,
    description: 'A rich waffle loaded with double layers of chocolate — smooth chocolate spread inside and melted chocolate drizzle on top. A must-have for true chocolate lovers.',
    image_url: '/images/products/double-chocolate-delight.png',
    is_available: true,
    is_featured: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Triple Chocolate Blast',
    slug: 'triple-chocolate-blast',
    category_id: 'premium-specials',
    category: {
      id: 'premium-specials',
      name: 'Premium Specials',
      slug: 'premium-specials',
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    price: 149,
    description: 'Indulge in a chocolate explosion with three layers of goodness — chocolate spread, chocolate chips, and a thick chocolate drizzle. Every bite is pure bliss.',
    image_url: '/images/products/triple-chocolate-blast.png',
    is_available: true,
    is_featured: true,
    sort_order: 3,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Dark Chocolate Heaven',
    slug: 'dark-chocolate-heaven',
    category_id: 'premium-specials',
    category: {
      id: 'premium-specials',
      name: 'Premium Specials',
      slug: 'premium-specials',
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    price: 139,
    description: 'Crafted for intense chocolate lovers, this waffle is topped with rich dark chocolate for a bold and slightly bitter-sweet flavor that feels premium and indulgent.',
    image_url: '/images/products/dark-chocolate-heaven.png',
    is_available: true,
    is_featured: true,
    sort_order: 4,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Oreo Crunch',
    slug: 'oreo-crunch',
    category_id: 'premium-specials',
    category: {
      id: 'premium-specials',
      name: 'Premium Specials',
      slug: 'premium-specials',
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    price: 149,
    description: 'Crispy waffle topped with crushed Oreo biscuits, creamy chocolate spread, and a smooth drizzle. A crunchy, creamy, and chocolatey delight in every bite.',
    image_url: '/images/products/oreo-crunch.png',
    is_available: true,
    is_featured: true,
    sort_order: 5,
    created_at: new Date().toISOString()
  }
];

export const CATEGORIES: Category[] = [
  {
    id: 'classic-waffles',
    name: 'Classic Waffles',
    slug: 'classic-waffles',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'chocolate-waffles',
    name: 'Chocolate Waffles',
    slug: 'chocolate-waffles',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'premium-specials',
    name: 'Premium Specials',
    slug: 'premium-specials',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

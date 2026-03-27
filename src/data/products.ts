import { Product, Category } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'abc53d96-e7fa-4e84-9947-93775cd950c7',
    name: 'Classic Waffle',
    slug: 'classic-waffle',
    category_id: '550e8400-e29b-41d4-a716-446655440000',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Classic Waffles',
      slug: 'classic-waffles',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    price: 1,
    description: 'Freshly baked golden waffle served warm with a light drizzle of chocolate syrup. Crispy outside, soft inside — perfect for a simple and satisfying treat.',
    image_url: '/images/products/classic-waffle.png',
    is_available: true,
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: '554da48d-842c-452f-b531-95ada5f3ee9f',
    name: 'Double Chocolate Delight',
    slug: 'double-chocolate-delight',
    category_id: '550e8400-e29b-41d4-a716-446655440001',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440001',
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
    id: '5d4acd1f-6586-43ae-8aef-5d1d46d6ae2b',
    name: 'Triple Chocolate Blast',
    slug: 'triple-chocolate-blast',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440002',
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
    id: 'c4ea7fdf-b8ca-4d28-ada6-3b5766ddcdda',
    name: 'Dark Chocolate Heaven',
    slug: 'dark-chocolate-heaven',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440002',
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
    id: '5414f7de-3460-4ae6-a67a-8b88921aea92',
    name: 'Oreo Crunch',
    slug: 'oreo-crunch',
    category_id: '550e8400-e29b-41d4-a716-446655440002',
    category: {
      id: '550e8400-e29b-41d4-a716-446655440002',
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
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Classic Waffles',
    slug: 'classic-waffles',
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Chocolate Waffles',
    slug: 'chocolate-waffles',
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Premium Specials',
    slug: 'premium-specials',
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

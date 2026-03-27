-- ==========================================
-- WAFFLE WALA - PHASE 2 SEED DATA
-- ==========================================

-- Seed Categories
INSERT INTO public.categories (id, name, slug, sort_order)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Classic Waffles', 'classic-waffles', 1),
    ('550e8400-e29b-41d4-a716-446655440001', 'Chocolate Waffles', 'chocolate-waffles', 2),
    ('550e8400-e29b-41d4-a716-446655440002', 'Premium Specials', 'premium-specials', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- Seed Products
INSERT INTO public.products (id, category_id, name, slug, description, price, image_url, is_featured, sort_order)
VALUES
    (
        'abc53d96-e7fa-4e84-9947-93775cd950c7', 
        '550e8400-e29b-41d4-a716-446655440000',
        'Classic Waffle',
        'classic-waffle',
        'Freshly baked golden waffle served warm with a light drizzle of chocolate syrup. Crispy outside, soft inside — perfect for a simple and satisfying treat.',
        89.00,
        '/images/products/classic-waffle.png',
        true,
        1
    ),
    (
        '554da48d-842c-452f-b531-95ada5f3ee9f',
        '550e8400-e29b-41d4-a716-446655440001',
        'Double Chocolate Delight',
        'double-chocolate-delight',
        'A rich waffle loaded with double layers of chocolate — smooth chocolate spread inside and melted chocolate drizzle on top. A must-have for true chocolate lovers.',
        129.00,
        '/images/products/double-chocolate-delight.png',
        true,
        2
    ),
    (
        '5d4acd1f-6586-43ae-8aef-5d1d46d6ae2b',
        '550e8400-e29b-41d4-a716-446655440002',
        'Triple Chocolate Blast',
        'triple-chocolate-blast',
        'Indulge in a chocolate explosion with three layers of goodness — chocolate spread, chocolate chips, and a thick chocolate drizzle. Every bite is pure bliss.',
        149.00,
        '/images/products/triple-chocolate-blast.png',
        true,
        3
    ),
    (
        'c4ea7fdf-b8ca-4d28-ada6-3b5766ddcdda',
        '550e8400-e29b-41d4-a716-446655440002',
        'Dark Chocolate Heaven',
        'dark-chocolate-heaven',
        'Crafted for intense chocolate lovers, this waffle is topped with rich dark chocolate for a bold and slightly bitter-sweet flavor that feels premium and indulgent.',
        139.00,
        '/images/products/dark-chocolate-heaven.png',
        true,
        4
    ),
    (
        '5414f7de-3460-4ae6-a67a-8b88921aea92',
        '550e8400-e29b-41d4-a716-446655440002',
        'Oreo Crunch',
        'oreo-crunch',
        'Crispy waffle topped with crushed Oreo biscuits, creamy chocolate spread, and a smooth drizzle. A crunchy, creamy, and chocolatey delight in every bite.',
        149.00,
        '/images/products/oreo-crunch.png',
        true,
        5
    )
ON CONFLICT (id) DO UPDATE SET 
    price = EXCLUDED.price, 
    description = EXCLUDED.description, 
    image_url = EXCLUDED.image_url;

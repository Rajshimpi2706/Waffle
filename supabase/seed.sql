-- ==========================================
-- WAFFLE WALA - PHASE 2 SEED DATA
-- ==========================================

-- Seed Categories
INSERT INTO public.categories (name, slug, sort_order)
VALUES
    ('Classic Waffles', 'classic-waffles', 1),
    ('Chocolate Waffles', 'chocolate-waffles', 2),
    ('Premium Specials', 'premium-specials', 3)
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
INSERT INTO public.products (category_id, name, slug, description, price, image_url, is_featured, sort_order)
SELECT c.id, p.name, p.slug, p.description, p.price, p.image_url, p.is_featured, p.sort_order
FROM (
    VALUES
    (
        'Classic Waffle',
        'classic-waffle',
        'Freshly baked golden waffle served warm with a light drizzle of chocolate syrup. Crispy outside, soft inside — perfect for a simple and satisfying treat.',
        89,
        '/images/products/classic-waffle.png',
        true,
        1,
        'classic-waffles'
    ),
    (
        'Double Chocolate Delight',
        'double-chocolate-delight',
        'A rich waffle loaded with double layers of chocolate — smooth chocolate spread inside and melted chocolate drizzle on top. A must-have for true chocolate lovers.',
        129,
        '/images/products/double-chocolate-delight.png',
        true,
        2,
        'chocolate-waffles'
    ),
    (
        'Triple Chocolate Blast',
        'triple-chocolate-blast',
        'Indulge in a chocolate explosion with three layers of goodness — chocolate spread, chocolate chips, and a thick chocolate drizzle. Every bite is pure bliss.',
        149,
        '/images/products/triple-chocolate-blast.png',
        true,
        3,
        'premium-specials'
    ),
    (
        'Dark Chocolate Heaven',
        'dark-chocolate-heaven',
        'Crafted for intense chocolate lovers, this waffle is topped with rich dark chocolate for a bold and slightly bitter-sweet flavor that feels premium and indulgent.',
        139,
        '/images/products/dark-chocolate-heaven.png',
        true,
        4,
        'premium-specials'
    ),
    (
        'Oreo Crunch',
        'oreo-crunch',
        'Crispy waffle topped with crushed Oreo biscuits, creamy chocolate spread, and a smooth drizzle. A crunchy, creamy, and chocolatey delight in every bite.',
        149,
        '/images/products/oreo-crunch.png',
        true,
        5,
        'premium-specials'
    )
) AS p(name, slug, description, price, image_url, is_featured, sort_order, category_slug)
JOIN public.categories c ON c.slug = p.category_slug
ON CONFLICT (slug) DO NOTHING;

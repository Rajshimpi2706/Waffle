-- ============================================================
-- WAFFLE STORE - SEED DATA
-- ============================================================

-- Branch
INSERT INTO branches (id, name, address, phone, email, tax_percentage, prices_include_tax)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'Waffle House — Main Street',
  '42, Main Street, Koramangala, Bengaluru, Karnataka 560034',
  '+91 98765 43210',
  'hello@wafflehouse.in',
  5.00,
  false
);

-- Categories
INSERT INTO categories (id, name, slug, description, sort_order, branch_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Classic Waffles',     'classic-waffles',    'Timeless Belgian-style waffles with buttery goodness',             1, 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'Chocolate Waffles',   'chocolate-waffles',  'Rich, decadent chocolate waffles for the true chocoholic',         2, 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000003', 'Premium Specials',    'premium-specials',   'Signature creations crafted with the finest seasonal ingredients',  3, 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000004', 'Beverages',           'beverages',          'Hot and cold drinks to complement your waffle experience',         4, 'b1000000-0000-0000-0000-000000000001');

-- Products
INSERT INTO products (id, branch_id, category_id, name, slug, description, base_price, is_featured, is_vegetarian, sort_order) VALUES
  -- Classic Waffles
  ('p1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Butter Bliss Waffle',      'butter-bliss-waffle',
   'Crispy golden Belgian waffle with whipped butter and maple syrup. The OG comfort.',
   149.00, true, true, 1),

  ('p1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Strawberry Dream Waffle',  'strawberry-dream-waffle',
   'Light, airy waffle piled with fresh strawberries and Chantilly cream.',
   189.00, false, true, 2),

  ('p1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
   'Banana Caramel Waffle',    'banana-caramel-waffle',
   'Warm waffle with caramelised bananas, salted caramel drizzle, and a dollop of cream.',
   199.00, true, true, 3),

  -- Chocolate Waffles
  ('p1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'Dark Choco Fudge Waffle',  'dark-choco-fudge-waffle',
   'Double-chocolate batter waffle drenched in warm dark chocolate fudge sauce.',
   229.00, true, true, 1),

  ('p1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'Nutella Bomb Waffle',      'nutella-bomb-waffle',
   'Crispy waffle smothered in generous Nutella, crushed hazelnuts, and chocolate chips.',
   249.00, true, true, 2),

  ('p1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'Triple Choco Waffle',      'triple-choco-waffle',
   'White, milk, and dark chocolate — all three on one decadent waffle.',
   269.00, false, true, 3),

  -- Premium Specials
  ('p1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003',
   'Lotus Biscoff Waffle',     'lotus-biscoff-waffle',
   'Thick Belgian waffle with Biscoff spread, caramelised crumble, and vanilla bean ice cream.',
   299.00, true, true, 1),

  ('p1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003',
   'Berry Cheesecake Waffle',  'berry-cheesecake-waffle',
   'Waffle base with creamy cheesecake filling, mixed berry compote, and graham crumble.',
   319.00, false, true, 2),

  ('p1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003',
   'Red Velvet Waffle',        'red-velvet-waffle',
   'Vibrant red velvet waffle with cream cheese frosting and white chocolate shavings.',
   329.00, true, true, 3),

  ('p1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003',
   'Matcha Zen Waffle',        'matcha-zen-waffle',
   'Ceremonial grade matcha waffle, sweet red bean paste, mochi, and sesame caramel.',
   349.00, false, true, 4),

  -- Beverages
  ('p1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004',
   'Belgian Hot Chocolate',    'belgian-hot-chocolate',
   'Rich, velvety hot chocolate made with real Belgian couverture chocolate.',
   149.00, false, true, 1),

  ('p1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004',
   'Cold Brew Latte',          'cold-brew-latte',
   'Smooth cold brew concentrate over milk, lightly sweetened. The perfect waffle companion.',
   169.00, false, true, 2);

-- Toppings / Add-ons
INSERT INTO toppings_addons (id, branch_id, name, price) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Extra Whipped Cream',       29.00),
  ('t1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Vanilla Ice Cream Scoop',   59.00),
  ('t1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Chocolate Drizzle',         19.00),
  ('t1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Caramel Drizzle',           19.00),
  ('t1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'Mixed Berries',             49.00),
  ('t1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'Crushed Nuts',              25.00);

-- Link all non-beverage products to toppings
INSERT INTO product_toppings (product_id, topping_id) VALUES
  ('p1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000003'),
  ('p1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000005'),
  ('p1000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000004'),
  ('p1000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000005', 't1000000-0000-0000-0000-000000000006'),
  ('p1000000-0000-0000-0000-000000000006', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000006', 't1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000007', 't1000000-0000-0000-0000-000000000002'),
  ('p1000000-0000-0000-0000-000000000008', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000008', 't1000000-0000-0000-0000-000000000005'),
  ('p1000000-0000-0000-0000-000000000009', 't1000000-0000-0000-0000-000000000001'),
  ('p1000000-0000-0000-0000-000000000010', 't1000000-0000-0000-0000-000000000001');

-- Delivery Zones (sample Bengaluru pincodes)
INSERT INTO delivery_zones (branch_id, pincode, delivery_fee, minimum_order_amount, estimated_delivery_minutes) VALUES
  ('b1000000-0000-0000-0000-000000000001', '560034', 30.00,  99.00, 30),
  ('b1000000-0000-0000-0000-000000000001', '560095', 40.00,  149.00, 40),
  ('b1000000-0000-0000-0000-000000000001', '560029', 50.00,  199.00, 50),
  ('b1000000-0000-0000-0000-000000000001', '560001', 60.00,  249.00, 60),
  ('b1000000-0000-0000-0000-000000000001', '560047', 40.00,  149.00, 45);

-- Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, max_discount_amount, min_cart_value, usage_limit, per_customer_limit, branch_id) VALUES
  ('WAFFLE10', '10% off on your order', 'percentage', 10.00, 100.00, 99.00, 1000, 1, 'b1000000-0000-0000-0000-000000000001'),
  ('FIRSTWAFFLE', 'Flat ₹50 off for first-time customers', 'fixed', 50.00, NULL, 149.00, 500, 1, 'b1000000-0000-0000-0000-000000000001');

-- Admin user (password must be set manually via Supabase Auth dashboard)
-- Replace 'auth-uuid-here' with actual auth.users UUID after creating the admin user in Supabase Auth
-- INSERT INTO admin_users (auth_user_id, branch_id, full_name, email, role)
-- VALUES ('auth-uuid-here', 'b1000000-0000-0000-0000-000000000001', 'Store Owner', 'admin@wafflehouse.in', 'owner');

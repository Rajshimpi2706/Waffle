-- ============================================================
-- WAFFLE STORE - ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user has specific admin role
CREATE OR REPLACE FUNCTION has_admin_role(roles admin_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE auth_user_id = auth.uid() AND is_active = true AND role = ANY(roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get customer id for current user
CREATE OR REPLACE FUNCTION my_customer_id()
RETURNS UUID AS $$
  SELECT id FROM customers WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- BRANCHES (public read, admin write)
-- ============================================================
CREATE POLICY "branches_public_read" ON branches FOR SELECT USING (is_active = true);
CREATE POLICY "branches_admin_all" ON branches FOR ALL USING (is_admin());

-- ============================================================
-- ADMIN USERS (owner can manage all, others read own)
-- ============================================================
CREATE POLICY "admin_users_owner_all" ON admin_users FOR ALL
  USING (has_admin_role(ARRAY['owner']::admin_role[]));
CREATE POLICY "admin_users_read_self" ON admin_users FOR SELECT
  USING (auth_user_id = auth.uid());

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE POLICY "customers_read_own" ON customers FOR SELECT
  USING (auth_user_id = auth.uid());
CREATE POLICY "customers_update_own" ON customers FOR UPDATE
  USING (auth_user_id = auth.uid());
CREATE POLICY "customers_insert_own" ON customers FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());
-- Admin can see all customers
CREATE POLICY "customers_admin_all" ON customers FOR ALL USING (is_admin());

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE POLICY "addresses_own" ON addresses FOR ALL
  USING (customer_id = my_customer_id());
CREATE POLICY "addresses_admin_read" ON addresses FOR SELECT USING (is_admin());

-- ============================================================
-- DELIVERY ZONES (public read for active zones)
-- ============================================================
CREATE POLICY "delivery_zones_public_read" ON delivery_zones FOR SELECT
  USING (is_active = true);
CREATE POLICY "delivery_zones_admin_all" ON delivery_zones FOR ALL USING (is_admin());

-- ============================================================
-- CATEGORIES (public read for active)
-- ============================================================
CREATE POLICY "categories_public_read" ON categories FOR SELECT
  USING (is_active = true);
CREATE POLICY "categories_admin_all" ON categories FOR ALL USING (is_admin());

-- ============================================================
-- PRODUCTS (public read for available)
-- ============================================================
CREATE POLICY "products_public_read" ON products FOR SELECT
  USING (is_available = true);
CREATE POLICY "products_admin_all" ON products FOR ALL USING (is_admin());

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE POLICY "variants_public_read" ON product_variants FOR SELECT USING (is_available = true);
CREATE POLICY "variants_admin_all" ON product_variants FOR ALL USING (is_admin());

-- ============================================================
-- TOPPINGS / ADD-ONS
-- ============================================================
CREATE POLICY "toppings_public_read" ON toppings_addons FOR SELECT USING (is_available = true);
CREATE POLICY "toppings_admin_all" ON toppings_addons FOR ALL USING (is_admin());

CREATE POLICY "product_toppings_public_read" ON product_toppings FOR SELECT USING (true);
CREATE POLICY "product_toppings_admin_all" ON product_toppings FOR ALL USING (is_admin());

-- ============================================================
-- COUPONS (no direct public read - validated via API)
-- ============================================================
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (is_admin());

-- ============================================================
-- ORDERS
-- ============================================================
CREATE POLICY "orders_read_own" ON orders FOR SELECT
  USING (customer_id = my_customer_id());
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (customer_id = my_customer_id());
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (is_admin());

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE POLICY "order_items_read_own" ON order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = my_customer_id())
  );
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE customer_id = my_customer_id())
  );
CREATE POLICY "order_items_admin_all" ON order_items FOR ALL USING (is_admin());

-- ============================================================
-- ORDER ITEM TOPPINGS
-- ============================================================
CREATE POLICY "order_item_toppings_read_own" ON order_item_toppings FOR SELECT
  USING (
    order_item_id IN (
      SELECT oi.id FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.customer_id = my_customer_id()
    )
  );
CREATE POLICY "order_item_toppings_admin_all" ON order_item_toppings FOR ALL USING (is_admin());

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE POLICY "payments_read_own" ON payments FOR SELECT
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = my_customer_id())
  );
CREATE POLICY "payments_admin_all" ON payments FOR ALL USING (is_admin());

-- ============================================================
-- COUPON USAGE
-- ============================================================
CREATE POLICY "coupon_usage_read_own" ON coupon_usage FOR SELECT
  USING (customer_id = my_customer_id());
CREATE POLICY "coupon_usage_admin_all" ON coupon_usage FOR ALL USING (is_admin());

-- ============================================================
-- REVIEWS (public read visible, write own + verified purchase)
-- ============================================================
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "reviews_own_read" ON reviews FOR SELECT
  USING (customer_id = my_customer_id());
CREATE POLICY "reviews_insert_verified" ON reviews FOR INSERT
  WITH CHECK (
    customer_id = my_customer_id() AND
    -- Must have a delivered order containing this product
    EXISTS (
      SELECT 1 FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = my_customer_id()
        AND o.id = reviews.order_id
        AND o.status = 'delivered'
        AND oi.product_id = reviews.product_id
    )
  );
CREATE POLICY "reviews_update_visibility_admin" ON reviews FOR UPDATE USING (is_admin());

-- ============================================================
-- AUDIT LOGS (admin read only, insert via service role)
-- ============================================================
CREATE POLICY "audit_logs_admin_read" ON audit_logs FOR SELECT
  USING (has_admin_role(ARRAY['owner', 'manager']::admin_role[]));

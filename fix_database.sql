-- ==========================================
-- WAFFLE WALA - DATABASE FIX SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ==========================================

-- 1. Create Customers Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  is_guest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Addresses Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Add customer_id column to orders table if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='customer_id') THEN
    ALTER TABLE public.orders ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Customers
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.customers;
CREATE POLICY "Users can manage their own profile" ON public.customers
  FOR ALL TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 6. RLS Policies for Addresses
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users can manage their own addresses" ON public.addresses
  FOR ALL TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

-- 7. RLS Policies for Orders
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE auth_user_id = auth.uid()));

-- 8. Public Access for testing (Optional but helpful if service key is missing)
-- Uncomment these if you are testing without Service Role Key
-- CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
-- CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

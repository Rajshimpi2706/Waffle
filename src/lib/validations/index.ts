import { z } from 'zod';

// ============================================================
// Auth
// ============================================================
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================================
// Address
// ============================================================
export const addressSchema = z.object({
  label: z.string().max(50).optional().default('Home'),
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().min(5, 'Address is too short').max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  is_default: z.boolean().optional().default(false),
});

// ============================================================
// Checkout
// ============================================================
export const guestContactSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
});

export const checkoutSchema = z.object({
  branch_id: z.string().uuid('Invalid branch selection'),
  order_type: z.enum(['delivery', 'takeaway', 'dine_in']),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().optional().nullable(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
    toppings: z.array(z.object({
      topping_id: z.string().uuid(),
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })).default([]),
  })).min(1, 'Cart cannot be empty'),
  shipping_address: addressSchema.optional(),
  address_id: z.string().uuid().optional(),
  coupon_code: z.string().optional(),
  special_instructions: z.string().max(500).optional(),
});

// ============================================================
// Coupon
// ============================================================
export const couponValidateSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  cart_total: z.number().positive(),
  customer_id: z.string().uuid().optional(),
});

// ============================================================
// Products (Admin)
// ============================================================
export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().max(1000).optional(),
  category_id: z.string().uuid(),
  price: z.number().positive().max(99999),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().min(0).default(0),
});

// ============================================================
// Category (Admin)
// ============================================================
export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

// ============================================================
// Coupon (Admin)
// ============================================================
export const couponCreateSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  description: z.string().max(200).optional(),
  discount_type: z.enum(['fixed', 'percentage']),
  discount_value: z.number().positive().max(100),
  max_discount_amount: z.number().positive().optional().nullable(),
  min_cart_value: z.number().min(0).default(0),
  usage_limit: z.number().int().positive().optional().nullable(),
  per_customer_limit: z.number().int().positive().default(1),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional().nullable(),
  is_active: z.boolean().default(true),
});

// ============================================================
// Delivery Zone (Admin)
// ============================================================
export const deliveryZoneSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  delivery_fee: z.number().min(0).max(9999),
  minimum_order_amount: z.number().min(0).max(99999),
  estimated_delivery_minutes: z.number().int().min(10).max(180),
  is_active: z.boolean().default(true),
});

// ============================================================
// Order Status Update (Admin)
// ============================================================
export const orderStatusSchema = z.object({
  status: z.enum([
    'pending', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled', 'refunded',
  ]),
});

// ============================================================
// Payment verify
// ============================================================
export const paymentVerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  order_id: z.string().uuid(),
});

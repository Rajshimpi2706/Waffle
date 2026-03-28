// ============================================================
// WAFFLE STORE - TypeScript Types
// ============================================================

export type AdminRole = 'owner' | 'manager' | 'staff';
export type OrderType = 'delivery' | 'takeaway' | 'dine_in';
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled'
  | 'refunded'
  | 'failed';

export type DiscountType = 'fixed' | 'percentage';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  tax_percentage: number;
  prices_include_tax: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  auth_user_id: string;
  branch_id?: string;
  full_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  auth_user_id?: string;
  full_name: string;
  email?: string;
  phone: string;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  branch_id: string;
  pincode: string;
  delivery_fee: number;
  minimum_order_amount: number;
  estimated_delivery_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  branch_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  price: number;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
  // Joins
  category?: Category;
  variants?: ProductVariant[];
  toppings?: ToppingAddon[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  is_available: boolean;
  sort_order: number;
}

export interface ToppingAddon {
  id: string;
  branch_id?: string;
  name: string;
  price: number;
  is_available: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  branch_id?: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount?: number;
  min_cart_value: number;
  usage_limit?: number;
  per_customer_limit: number;
  used_count: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  branch_id?: string;
  customer_id?: string;
  address_id?: string;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  total_amount: number;
  delivery_fee?: number;
  discount_amount?: number;
  coupon_code?: string;
  special_instructions?: string;
  confirmed_at?: string;
  preparing_at?: string;
  ready_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
  // Joins
  customer?: Customer;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
  line_total: number;
}

export interface OrderItemTopping {
  id: string;
  order_item_id: string;
  topping_id?: string;
  topping_name: string;
  price: number;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failure_reason?: string;
  method?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  is_visible: boolean;
  created_at: string;
  customer?: Customer;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  actor_role?: string;
  action_type: string;
  entity_type: string;
  entity_id?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ============================================================
// CART TYPES (client-side)
// ============================================================
export interface CartTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // local cart item id
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  toppings: CartTopping[];
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DeliveryZoneCheckResponse {
  serviceable: boolean;
  delivery_fee?: number;
  minimum_order_amount?: number;
  estimated_delivery_minutes?: number;
  message?: string;
}

export interface CouponValidateResponse {
  valid: boolean;
  discount_amount?: number;
  message?: string;
  coupon?: Coupon;
}

export interface OrderCreateRequest {
  branch_id: string;
  customer: {
    full_name: string;
    email?: string;
    phone: string;
  };
  address?: Omit<Address, 'id' | 'customer_id' | 'created_at'>;
  address_id?: string;
  order_type: OrderType;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    toppings?: { topping_id: string }[];
  }[];
  coupon_code?: string;
  special_instructions?: string;
}

export interface DashboardStats {
  today_orders: number;
  today_revenue: number;
  new_customers: number;
  repeat_customers: number;
  top_products: { name: string; count: number; revenue: number }[];
}

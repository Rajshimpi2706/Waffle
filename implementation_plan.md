# Waffle Store Web Application — Implementation Plan

A full-stack, production-ready food ordering web app for a waffle store brand. Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and **Razorpay**.

---

## Proposed Changes

### 1. Project Bootstrap

Bootstrap using `create-next-app` with App Router, TypeScript, Tailwind CSS. Configure `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`.

---

### 2. Database Layer

#### [NEW] `supabase/schema.sql`

**`branches`** — includes:
- `tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0`
- `prices_include_tax BOOLEAN NOT NULL DEFAULT false`

**`products`** — includes:
- `track_inventory BOOLEAN NOT NULL DEFAULT false`
- `stock_quantity INTEGER NULL`
- Auto-enforce `sold_out = true` when `track_inventory = true AND stock_quantity <= 0` (via DB trigger)

**`orders`** — includes:
- `order_number TEXT UNIQUE NOT NULL` — generated server-side as `WAFFLE-YYYYMMDD-XXXX`; shown to customers and admins instead of raw UUIDs
- `branch_id NOT NULL` — all orders are branch-scoped (supports analytics, delivery zones, multi-branch)
- Lifecycle timestamps (all nullable):
  `confirmed_at`, `preparing_at`, `ready_at`, `out_for_delivery_at`, `delivered_at`, `cancelled_at`, `refunded_at`

**`delivery_zones`** — per-branch, per-pincode:
`id`, `branch_id`, `pincode`, `delivery_fee`, `minimum_order_amount`, `estimated_delivery_minutes`, `is_active`

**`audit_logs`** — tracks:
- Admin login attempts, product create/update/delete, price changes, inventory changes
- Coupon create/update/deactivate, order status changes, manual cancellation/refund
- Fields: `actor_user_id`, `actor_role`, `action_type`, `entity_type`, `entity_id`, `previous_value (JSONB)`, `new_value (JSONB)`, `ip_address`, `created_at`

Full schema also includes: `admin_users`, `customers`, `addresses`, `categories`, `product_variants`, `toppings_addons`, `product_toppings`, `order_items`, `order_item_toppings`, `payments`, `coupons`, `coupon_usage`, `reviews`. Indexes on all FK and commonly queried columns.

#### [NEW] `supabase/rls.sql`
Customers see only their data; admins scoped by role; public read for available products/categories; verified-purchase gating for reviews.

#### [NEW] `supabase/seed.sql`
1 branch, categories, 12+ products (with inventory fields), toppings, coupons, delivery zones, 1 admin user.

#### 2.1 Business Rules
- **Repeat customer**: `COUNT(completed orders) > 1`
- **Revenue**: SUM of `payments.amount` where `status = paid` AND order not cancelled/refunded; branch-scoped
- **Tax**: calculated from `branch.tax_percentage`; checkout shows subtotal, tax, delivery fee, discount, final total separately; respects `prices_include_tax` flag
- **Inventory**: if `track_inventory = false` → availability controlled by `available`/`sold_out` flags; if `true` → auto-enforce `sold_out` when `stock_quantity <= 0`
- **Reorder**: re-prices at current product prices; skips unavailable/sold-out/zero-stock items
- **Delivery serviceability**: check `delivery_zones` for matching pincode + `is_active = true`; block checkout if none found
- **Order timeout**: unpaid orders auto-cancel after 15 min (pg_cron or server job)
- **Payment states**: `pending → paid | failed | refunded`
- **Order number format**: `WAFFLE-YYYYMMDD-NNNN` (zero-padded daily sequence), generated at order creation

---

### 3. Core Utilities & Config

- `src/lib/supabase/server.ts` — SSR Supabase client; stricter session timeout for admin (configurable via env)
- `src/lib/supabase/client.ts` — Browser client with silent token refresh
- `src/lib/supabase/middleware.ts` — Session refresh + expiry redirect with friendly message
- `src/lib/validations/` — Zod schemas (checkout, auth, coupon, product, delivery zone)
- `src/lib/razorpay.ts` — Order creation + HMAC verification (server-only)
- `src/lib/utils.ts` — Currency formatting, date helpers, order number generator
- `src/lib/cart.ts` — Guest cart (localStorage) → user cart merge on login; DB sync for logged-in users
- `src/lib/realtime.ts` — Supabase Realtime order subscription + 15s polling fallback
- `src/lib/logger.ts` — Structured JSON logs; Sentry DSN placeholder; `logPaymentFailure(orderId, reason)`
- `src/lib/rateLimit.ts` — Per-IP rate limiting (in-memory default; Redis via Upstash in prod)
- `src/lib/audit.ts` — Helper to write `audit_logs` rows consistently from server actions/API routes
- `src/types/` — TypeScript interfaces for all DB entities and API responses
- `middleware.ts` — Route protection + rate limiting for sensitive API paths

---

### 4. Design System

Warm brand palette: deep chocolate (`#3B1F0A`), caramel (`#C17839`), cream (`#FDF6EC`), gold (`#E8A535`). Fonts: Playfair Display (headings) + Inter (body).

**Mobile-First Rules**: 44×44px min tap targets; sticky bottom CTA bar; sticky cart summary on mobile; minimal 3-step checkout; progress indicator always visible.

---

### 5. Reusable UI Components (`src/components/ui/`)

`Button`, `Input`, `Textarea`, `Select`, `Modal`, `Badge`, `Spinner`, `Toast` (sonner), `EmptyState`, `ErrorState`, `ProductCard` (next/image + blur placeholder + sold-out overlay), `Navbar`, `Footer`, `WhatsAppButton`.

---

### 6. Customer-Facing Pages (`src/app/(store)/`)

- **Homepage** — Hero, featured waffles, offers, testimonials, CTA, LocalBusiness JSON-LD, OG images
- **Menu** — Category tabs, search, sort, filter, product grid, sold-out overlay
- **Product Detail** — Customization, sticky bottom CTA
- **Cart** — Guest localStorage cart; merges on login; optional DB sync
- **Checkout** — Pincode validation → delivery fee + ETA; tax breakdown; coupon; Razorpay; payment failure screen + **Retry Payment** button; sticky order summary on mobile
- **Order Success** — Human-readable `order_number`, item list, ETA
- **Order Tracking** — Human-readable `order_number`; lifecycle timestamps rendered as timeline; Supabase Realtime + polling fallback
- **Account** — Profile, addresses, order history, reorder; "Log out from all devices" option

---

### 7. Auth Pages (`src/app/(auth)/`)

- `/login`, `/signup`, `/forgot-password`, `/reset-password`
- Expired sessions → clean redirect to `/login` with friendly message
- Brute-force protection: 5 attempts / 15 min per IP
- CAPTCHA-ready hooks (env flag)
- Admin sessions use stricter timeout than customer sessions

---

### 8. Admin Dashboard (`src/app/admin/`)

Protected by role middleware. Sidebar layout.

- `/admin/login` — brute-force protected
- `/admin` → Dashboard (Recharts: orders, revenue, repeat/new customers, top products)
- `/admin/products` — add/edit/delete; availability toggle; **inventory tracking toggle + stock quantity editor**
- `/admin/categories`, `/admin/toppings`
- `/admin/orders` — list, status updater (writes lifecycle timestamps + audit log), filter
- `/admin/customers` — list, per-customer history, CSV export
- `/admin/coupons`, `/admin/reviews`
- `/admin/delivery-zones` — manage serviceable pincodes + fees per branch

---

### 9. API Routes (`src/app/api/`)

- `POST /api/orders/create` — validate cart + pincode, compute tax, generate `order_number`, create Razorpay order; rate-limited
- `POST /api/payments/verify` — HMAC verify; update payment + order status + lifecycle timestamp; log failures; write audit log
- `POST /api/payments/retry` — recreate Razorpay order for pending/failed payment; rate-limited
- `POST /api/coupons/validate` — validity + usage check; rate-limited
- `GET /api/delivery-zones/check?pincode=` — serviceability + fee + ETA
- `PATCH /api/admin/orders/[id]` — update status + lifecycle timestamp + audit log (role-checked)
- `POST /api/admin/products` — create/update product + inventory fields (owner/manager only) + audit log
- `GET /api/admin/dashboard` — aggregate stats

---

### 10. SEO & Legal

- `sitemap.ts`, `robots.ts`, `opengraph-image.png`
- Global metadata with OG + Twitter card
- `/privacy-policy`, `/refund-policy`, `/terms`

---

### 11. Config & Deployment

#### `.env.example`
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
SENTRY_DSN=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
ADMIN_SESSION_TIMEOUT_MINUTES=30
```

#### Security
- Rate limits: auth (5/15min), coupon (10/min), order creation (3/min) per IP
- Redis-backed limiting in multi-instance prod (Upstash)
- CAPTCHA-ready, bot protection via security headers

#### Backup & Recovery
- Supabase automated daily backups (Pro plan)
- Admin CSV export for orders/customers/payments
- pg_dump guidance for self-hosted
- Restore checklist in `DEPLOYMENT.md`

---

## Verification Plan

```bash
cd d:\waffle && npm run dev   # dev server
npm run build                 # must pass with 0 TS errors
```

Manual checks: guest cart merge, pincode validation, tax breakdown, payment failure + retry, realtime tracking, admin status update with audit log, brute-force lock, structured error logs.

> [!IMPORTANT]
> Razorpay uses **test mode keys** — no real charges.

> [!NOTE]
> `REPLICA IDENTITY FULL` required on `orders` for Realtime — included in `schema.sql`.

> [!NOTE]
> Rate limiting uses in-memory by default; set `UPSTASH_REDIS_URL` for production.

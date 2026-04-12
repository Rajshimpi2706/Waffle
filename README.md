# 🧇 Waffle Wala

> A full-stack, production-grade digital food ordering platform — built to bring the experience of a premium waffle shop directly to customers' smartphones.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2951?logo=razorpay)](https://razorpay.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [System Architecture](#-system-architecture)
5. [Payment Flow](#-payment-flow)
6. [Order Management Flow](#-order-management-flow)
7. [Admin Panel](#-admin-panel)
8. [Project Structure](#-project-structure)
9. [Setup Instructions](#-setup-instructions)
10. [Environment Variables](#-environment-variables)
11. [Deployment](#-deployment)
12. [Database Setup](#-database-setup)
13. [Security](#-security)
14. [Future Improvements](#-future-improvements)

---

## 🏪 Project Overview

**Waffle Wala** is a real-world, production-ready digital food ordering platform designed for a premium waffle café. It combines a beautiful, mobile-first customer storefront with a powerful admin panel to manage the entire order lifecycle — from browsing the menu to door-step delivery tracking.

### The Business Problem it Solves

Traditional waffle shops rely on walk-ins and phone orders — both inefficient and hard to scale. Waffle Wala eliminates that friction by providing:

- A **digital menu** with photos and descriptions, accessible 24/7
- **Online ordering** with Razorpay payment gateway integration
- **Real-time order tracking** so customers always know when their food is ready
- An **admin operations panel** to manage orders, products, and customers without touching code

This is not a demo project. It is a business-in-a-box for any food entrepreneur who wants to digitize their operations with minimal upfront cost and maximum reliability.

---

## ✨ Features

### 👥 Customer Side

| Feature | Description |
|---|---|
| 🏠 **Homepage** | Premium hero experience with 3D waffle showcase and featured bestsellers |
| 📋 **Menu Browsing** | Browse all products organized by categories (Classic, Double Chocolate, Triple Chocolate, etc.) |
| 🛒 **Add to Cart** | Real-time cart management with quantity controls, persisted across sessions using Zustand |
| 📦 **Checkout** | Multi-step checkout with delivery address, contact info, and order summary |
| 💳 **Razorpay Payments** | Secure, PCI-compliant payment gateway with UPI, cards, net banking, and wallets |
| 📍 **Order Tracking** | Live order status timeline (Placed → Confirmed → Preparing → Out for Delivery → Delivered) |
| 📜 **Order History** | View all past orders with statuses and details in the account page |
| 🔐 **OTP Login** | Phone number + OTP authentication via Supabase Auth |
| 🔑 **Google OAuth** | One-tap Google sign-in for maximum conversion |
| 📞 **Contact Page** | Direct WhatsApp integration for customer support |
| 📄 **Legal Pages** | Privacy Policy, Terms of Service, and Refund Policy |

### 🛠️ Admin Side

| Feature | Description |
|---|---|
| 🔐 **Secure Login** | Separate admin login with role-based access control (Owner / Manager / Staff) |
| 📊 **Dashboard** | Analytics overview with order counts, revenue, and recent activity |
| 📋 **Order Management** | View all orders in real-time, filter by status, update lifecycle stages |
| 👥 **Customer Management** | View all registered customers with contact info and order history |
| 🍽️ **Product Management** | Add, edit, or remove products and manage categories |
| 🚦 **Status Updates** | One-click order status transitions with audit trail |
| 📦 **Delivery Zone Config** | Manage serviceable areas |
| 🔒 **Role-Based Access** | Granular permissions — Owners see everything, Staff only see orders |

---

## 🛠️ Tech Stack

### Next.js 16 (App Router)

**What it is:** The full-stack React meta-framework by Vercel, using the modern App Router paradigm.

**Why it's used:**
- Server Components and Client Components give fine-grained control over rendering
- Built-in API Routes for backend logic without a separate server
- Middleware for authentication guards running at the Edge, before any page renders
- Excellent Vercel deployment with zero-config CI/CD

**Where it's used:** Every page, layout, and API route in the `src/app/` directory

---

### React 19

**What it is:** The UI library powering all interactive components.

**Why it's used:** Latest React 19 brings improved hydration, concurrent rendering, and better Suspense boundaries — all critical for a smooth ordering experience.

**Where it's used:** All `.tsx` components and pages throughout the project.

---

### Tailwind CSS v4

**What it is:** A utility-first CSS framework for building custom designs rapidly.

**Why it's used:** Enables rapid, consistent styling with full design control. v4 uses the new CSS-native engine with zero configuration overhead.

**Where it's used:** Every component's styling — from the premium hero section to the admin dashboard tables.

---

### Supabase (Auth + Database)

**What it is:** An open-source Firebase alternative — provides PostgreSQL database, authentication, and real-time subscriptions.

**Why it's used:**
- **Auth**: Handles OTP (phone), Google OAuth, and session management out of the box
- **Database**: PostgreSQL — relational, reliable, scalable
- **Row Level Security (RLS)**: Ensures customers can only see their own orders; admins can see all
- **Real-time**: Pushes live order status updates to customers without polling

**Where it's used:**
- `src/lib/supabase/` — client, server, and middleware Supabase clients
- `supabase/schema.sql` — full database schema
- `supabase/rls.sql` — row-level security policies
- All API routes that read/write data

---

### Razorpay

**What it is:** India's leading payment gateway — supports UPI, net banking, cards, and wallets.

**Why it's used:** Native INR support, high success rates, and easy integration via a JavaScript SDK and server-side API.

**Where it's used:**
- `src/lib/razorpay.ts` — server-side Razorpay client initialization
- `/api/payments/create-order` — creates a Razorpay Order ID server-side
- `/api/payments/verify` — cryptographically verifies payment signature after success

---

### Zustand

**What it is:** A minimal, fast, scalable state management library for React.

**Why it's used:** Redux is overkill for a food ordering cart. Zustand is lightweight (~1KB), has excellent TypeScript support, and supports persistence middleware to keep the cart alive across page refreshes.

**Where it's used:** `src/lib/cart.ts` — the global cart store managing items, quantities, and totals.

---

### Additional Libraries

| Library | Purpose |
|---|---|
| `react-hook-form` | Performant form state management for checkout and auth forms |
| `zod` | Schema validation for all user inputs (forms, API payloads) |
| `lucide-react` | Consistent, beautiful icon system |
| `date-fns` | Date formatting for order timestamps |
| `recharts` | Analytics charts on the admin dashboard |
| `sonner` | Toast notifications for actions (added to cart, order placed, etc.) |
| `clsx` + `tailwind-merge` | Conditional and conflict-safe Tailwind class composition |

---

### Vercel (Deployment)

**What it is:** The cloud platform built for Next.js — provides serverless deployment, Edge Middleware, and global CDN.

**Why it's used:** Zero-configuration Next.js deployment, automatic SSL, preview deployments on Pull Requests, and seamless environment variable management.

**Where it's used:** Production deployment target (see [Deployment](#-deployment) section).

---

## 🏗️ System Architecture

```
Customer Browser
       │
       ▼
  ┌─────────────────────────────┐
  │   Next.js App (Vercel)      │
  │                             │
  │  ┌─────────┐  ┌──────────┐ │
  │  │ Pages   │  │ API      │ │
  │  │ (SSR/   │  │ Routes   │ │
  │  │  CSR)   │  │ /api/**  │ │
  │  └─────────┘  └──────────┘ │
  │         │           │      │
  └─────────┼───────────┼──────┘
            │           │
    ┌────────▼──┐  ┌────▼────────────┐
    │ Supabase  │  │ Razorpay API    │
    │ (Auth +   │  │ (Payment        │
    │  Postgres)│  │  Orders)        │
    └────────┬──┘  └────────────────-┘
             │
    ┌────────▼──────────┐
    │  Real-time Push   │
    │  (Order Updates)  │
    └───────────────────┘
             │
    ┌────────▼──────────┐
    │   Admin Panel     │
    │   /admin/**       │
    └───────────────────┘
```

### Data Flow: End-to-End

1. **User visits** the storefront → Next.js serves the page (SSR or SSG)
2. **User logs in** → Supabase Auth handles OTP/Google OAuth, sets session cookies
3. **User browses menu** → Static product data from `/src/data/products.ts`
4. **User adds to cart** → Zustand store updates in-memory + localStorage
5. **User checks out** → Checkout page collects delivery info, validates with Zod
6. **Payment is initiated** → `/api/payments/create-order` creates a Razorpay Order ID
7. **Razorpay checkout** opens in-browser → User completes payment
8. **Payment verification** → `/api/payments/verify` validates the signature server-side
9. **Order is saved** → Supabase `orders` table updated with `status: 'confirmed'`
10. **Admin is notified** → Real-time subscription on admin dashboard shows new order
11. **Admin updates status** → Status change triggers Supabase real-time push
12. **Customer sees update** → Order tracking page updates live via Supabase real-time

---

## 💳 Payment Flow

The payment flow follows a secure, server-side-verified pattern:

```
Checkout Page
     │
     ▼
POST /api/payments/create-order
     │  (Creates Razorpay Order ID server-side)
     │  (Returns: order_id, amount, currency, key)
     ▼
Razorpay Checkout (in-browser SDK)
     │  (User pays via UPI / Card / Netbanking)
     ▼
Payment Success Callback
     │  (Razorpay returns: razorpay_payment_id,
     │                     razorpay_order_id,
     │                     razorpay_signature)
     ▼
POST /api/payments/verify
     │  (Server verifies HMAC-SHA256 signature)
     │  (Prevents fake payment confirmations)
     ▼
POST /api/orders/create
     │  (Creates order in Supabase orders table)
     │  (Status: 'confirmed')
     ▼
Redirect → /order/[id]
     │  (Order confirmation + tracking page)
```

### Failure Handling

- If signature verification **fails** → order is **not created**, user sees error
- If user **closes the payment modal** → order is not created, cart is preserved
- If the redirect is disrupted → the order can be queried by Razorpay order ID
- `/payment-failed` page handles graceful failure messaging

---

## 📦 Order Management Flow

### Order Lifecycle

```
placed → confirmed → preparing → out_for_delivery → delivered
                                                  ↘ cancelled
```

| Status | Trigger | Who Sets It |
|---|---|---|
| `placed` | Order created (before payment verification) | System |
| `confirmed` | Payment successfully verified | System (auto) |
| `preparing` | Kitchen starts working | Admin |
| `out_for_delivery` | Order dispatched | Admin |
| `delivered` | Order received by customer | Admin |
| `cancelled` | Order cancelled | Admin / System |

### Tracking Page

- `/order/[id]` — Customer-facing order tracking page
- Displays a live status timeline with timestamps
- Supabase Realtime subscription listens for `UPDATE` events on the `orders` table
- No page refresh required — status changes appear within seconds

### Admin Order Updates

- Admin visits `/admin/orders` → sees all orders with current status
- One-click status update buttons for each order
- Status transitions are validated server-side (can't skip from `placed` to `delivered`)
- An audit trail is maintained for all status changes

---

## 🛡️ Admin Panel

The admin panel lives at `/admin` and is completely separate from the customer storefront.

### Access Control

- Protected by **Next.js Middleware** — unauthenticated users are redirected to `/admin/login` before the page even renders
- Role-based access: `owner` > `manager` > `staff`
- Roles are stored in the `admin_users` table in Supabase, linked to Supabase Auth user IDs

### What the Admin Can Do

**Dashboard (`/admin`)**
- Revenue stats and order counts
- Recent orders at a glance
- Charts via Recharts

**Orders (`/admin/orders`)**
- View all orders sorted by date (newest first)
- Filter by status
- Click any order to expand customer details and items
- Update order status with audit trail

**Customers (`/admin/customers`)**
- View all registered customers
- See order count and contact information
- Search and filter

**Products (`/admin/products`)**
- View and manage all products
- Organized by category

### Admin Authentication Flow

1. Admin visits `/admin/login`
2. Enters email + password (managed via Supabase Auth)
3. Middleware verifies session + checks `admin_users` table for valid role
4. Unauthorized users are bounced back to `/admin/login?reason=unauthorized`
5. Session timeout configurable via `ADMIN_SESSION_TIMEOUT_MINUTES` env variable

---

## 📁 Project Structure

```
waffle/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth layout group
│   │   │   ├── login/              # Customer login page (OTP + Google)
│   │   │   └── signup/             # Customer signup page
│   │   ├── (store)/                # Customer storefront layout group
│   │   │   ├── page.tsx            # Homepage (Hero, Bestsellers)
│   │   │   ├── menu/               # Full menu page
│   │   │   ├── checkout/           # Checkout flow
│   │   │   ├── order/[id]/         # Order tracking page
│   │   │   ├── account/            # Customer account + order history
│   │   │   ├── about/              # About page
│   │   │   ├── contact/            # Contact + WhatsApp support
│   │   │   ├── payment-failed/     # Payment failure page
│   │   │   ├── privacy-policy/     # Legal
│   │   │   ├── refund-policy/      # Legal
│   │   │   └── terms/              # Legal
│   │   ├── admin/                  # Admin panel
│   │   │   ├── login/              # Admin login
│   │   │   ├── setup/              # Initial admin bootstrap
│   │   │   └── (dashboard)/        # Protected admin layout
│   │   │       ├── page.tsx        # Admin dashboard
│   │   │       ├── orders/         # Order management
│   │   │       ├── customers/      # Customer management
│   │   │       └── products/       # Product management
│   │   ├── api/                    # Backend API Routes
│   │   │   ├── orders/
│   │   │   │   ├── create/         # POST: Create order after payment
│   │   │   │   └── [id]/           # GET/PATCH: Order details + status update
│   │   │   ├── payments/
│   │   │   │   ├── create-order/   # POST: Create Razorpay order
│   │   │   │   └── verify/         # POST: Verify payment signature
│   │   │   ├── products/           # Product CRUD APIs
│   │   │   ├── admin/              # Admin-only APIs (role-guarded)
│   │   │   └── delivery-zones/     # Delivery zone management
│   │   ├── globals.css             # Global styles and design tokens
│   │   ├── layout.tsx              # Root layout
│   │   ├── robots.ts               # SEO: robots.txt
│   │   └── sitemap.ts              # SEO: sitemap.xml
│   │
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── HeroExperience.tsx  # Animated homepage hero
│   │   │   └── ...
│   │   └── auth/                   # Auth-specific components
│   │
│   ├── lib/                        # Core utilities and integrations
│   │   ├── supabase/               # Supabase client factories
│   │   │   ├── client.ts           # Browser client (CSR)
│   │   │   └── server.ts           # Server client (SSR/API)
│   │   ├── cart.ts                 # Zustand cart store
│   │   ├── razorpay.ts             # Razorpay server client
│   │   ├── adminAuth.ts            # Admin session utilities
│   │   ├── audit.ts                # Audit trail logging
│   │   ├── rateLimit.ts            # Request rate limiting (Redis/in-memory)
│   │   ├── realtime.ts             # Supabase Realtime helpers
│   │   ├── logger.ts               # Structured logging
│   │   ├── env.ts                  # Type-safe env variable access
│   │   ├── utils.ts                # Shared utility functions
│   │   └── validations/            # Zod schemas
│   │
│   ├── data/
│   │   └── products.ts             # Product catalogue (static data)
│   │
│   ├── types/                      # TypeScript type definitions
│   └── middleware.ts               # Auth guard middleware (Edge runtime)
│
├── supabase/
│   ├── schema.sql                  # Full database schema
│   ├── rls.sql                     # Row Level Security policies
│   ├── seed.sql                    # Seed data (categories, initial admin)
│   └── admin_helpers.sql           # Admin utility functions
│
├── public/                         # Static assets (images, icons)
├── .env.example                    # Environment variable template
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── DEPLOYMENT.md                   # Detailed deployment guide
└── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- A [Supabase](https://supabase.com/) account and project
- A [Razorpay](https://razorpay.com/) account (test mode is fine for development)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/waffle-wala.git
cd waffle-wala
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials (see [Environment Variables](#-environment-variables) section below).

### 4. Set Up the Database

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Go to **SQL Editor**
3. Run the following scripts in order:

```sql
-- Step 1: Create all tables, functions, and triggers
-- Paste contents of: supabase/schema.sql

-- Step 2: Apply Row Level Security policies
-- Paste contents of: supabase/rls.sql

-- Step 3: (Optional) Seed with default data
-- Paste contents of: supabase/seed.sql
```

4. Enable Realtime for the `orders` table:
   - Go to **Database → Tables → orders**
   - Enable **Replication** for `INSERT` and `UPDATE` events

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the customer storefront.

The admin panel is available at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## 🔐 Environment Variables

Create a `.env.local` file in the root of the project with the following:

```env
# ─── Supabase ───────────────────────────────────────────────────
# Get these from: Supabase Dashboard → Project Settings → API

# The URL of your Supabase project (safe to expose publicly)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# The anonymous/public API key (safe to expose publicly)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# The service role key — NEVER expose this in client-side code
# Used only in server-side API routes for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ─── Razorpay ───────────────────────────────────────────────────
# Get these from: Razorpay Dashboard → Settings → API Keys

# The Key ID (safe to expose publicly — used in browser SDK)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# The Key ID again (used on server side)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx

# The Key Secret — NEVER expose this in client-side code
# Used to create and verify orders server-side
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# ─── Application ────────────────────────────────────────────────
# The public URL of your app (used for redirects and sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# WhatsApp number for customer support (include country code, no +)
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210

# ─── Rate Limiting (Production Only) ────────────────────────────
# Get from: https://upstash.com/ (free tier available)
# Required in serverless production — in-memory fallback used locally
UPSTASH_REDIS_URL=https://your-upstash-endpoint.upstash.io
UPSTASH_REDIS_TOKEN=your-upstash-token

# ─── Admin Settings ─────────────────────────────────────────────
# How long (in minutes) before an admin session expires (default: 30)
ADMIN_SESSION_TIMEOUT_MINUTES=30
```

> **Security Note:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## 🚢 Deployment

### Deploying to Vercel (Recommended)

Vercel is the recommended deployment platform — it offers zero-config Next.js hosting with automatic builds on every push to your main branch.

**Step 1: Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**Step 2: Import to Vercel**

1. Go to [vercel.com](https://vercel.com/) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no build config needed

**Step 3: Add Environment Variables**

In the Vercel dashboard under **Settings → Environment Variables**, add all variables from your `.env.local` file.

> Set `NEXT_PUBLIC_SITE_URL` to your actual production domain (e.g., `https://waffle-wala.vercel.app`)

**Step 4: Deploy**

Click **Deploy**. Your app will be live in under 2 minutes.

### Post-Deployment Checklist

- [ ] Visit `/admin/login` and confirm you can log in with your seeded admin credentials
- [ ] Place a test order using Razorpay test mode (card: `4111 1111 1111 1111`)
- [ ] Verify the order appears in both Supabase and the admin dashboard
- [ ] Open the order tracking page and confirm real-time updates work
- [ ] Test Google OAuth and OTP login flows

### Alternative: Node.js Server / VPS

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to a custom server (DigitalOcean, AWS EC2, etc.) using PM2 and Nginx.

---

## 🗄️ Database Setup

The database schema is defined in `supabase/schema.sql`. Key tables:

| Table | Description |
|---|---|
| `profiles` | Customer profiles linked to Supabase Auth users |
| `orders` | Order records with status, total, and delivery address |
| `order_items` | Line items for each order (product ID, quantity, price) |
| `admin_users` | Admin accounts with role assignments (`owner`, `manager`, `staff`) |
| `products` | Menu products with name, price, category, image |
| `categories` | Product category definitions |
| `delivery_zones` | Serviceable delivery areas |

Row Level Security (RLS) policies in `supabase/rls.sql` ensure:
- Customers can only read/write their **own** orders and profiles
- The service role (server-side) can access everything
- Admin roles have elevated access scoped to their permission level

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| **Authentication** | Supabase Auth with server-side session validation on every request |
| **Route Protection** | Next.js Edge Middleware guards `/admin` and `/account` before page render |
| **Payment Verification** | HMAC-SHA256 signature verification prevents fake payment callbacks |
| **API Authorization** | Admin API routes double-checked at middleware + handler level |
| **Row Level Security** | Supabase RLS prevents unauthorized database reads/writes |
| **Rate Limiting** | Configurable rate limiting on payment and order APIs (Redis in production) |
| **Input Validation** | All user inputs validated with Zod schemas before processing |
| **Secret Management** | Service role key and Razorpay secret never exposed to the browser |

---

## 🔮 Future Improvements

| Feature | Description |
|---|---|
| 📱 **Push Notifications** | Notify customers via web push when order status changes |
| 📊 **Advanced Analytics** | Revenue trends, peak hours, popular items dashboard |
| 💬 **Real-time Chat** | In-app customer support powered by Supabase Realtime |
| 🖨️ **Print Receipts** | PDF invoice generation for orders |
| 🗺️ **Live Delivery Tracking** | GPS map tracking for delivery agents |
| 🎁 **Loyalty Program** | Points system to reward repeat customers |
| 📣 **Promotions Engine** | Coupon codes and time-limited discounts |
| 🌐 **Multi-location Support** | Manage multiple waffle shop branches from one admin |
| 🔔 **Webhook Support** | Dedicated Razorpay webhook endpoint for payment reliability |
| 🧪 **E2E Tests** | Playwright test suite for critical checkout and payment flows |

---

## 👨‍💻 Author

Built by **Raj Shimpi** — a full-stack developer passionate about building real-world products with modern technology.

- GitHub: [@Rajshimpi2706](https://github.com/Rajshimpi2706)

---

## 📃 License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  Made with ❤️ and lots of chocolate 🍫
</p>

# Waffle Store Deployment Guide

This document outlines the steps to deploy the Waffle Store web application to production.

## Prerequisites

1.  **Supabase Project**: A live Supabase project.
2.  **Razorpay Account**: A Razorpay account with live API keys (if ready for real transactions) or test keys for staging.
3.  **Vercel Account** (Recommended for Next.js) or a Node.js server.
4.  **Upstash Redis Account** (Required for production rate limiting).

---

## 1. Database Setup (Supabase)

1.  Navigate to your Supabase project dashboard -> **SQL Editor**.
2.  Run the `/supabase/schema.sql` script to create all tables, functions, and triggers.
3.  Run the `/supabase/rls.sql` script to apply Row Level Security policies.
4.  *(Optional but recommended initially)* Run `/supabase/seed.sql` to populate default categories and a primary admin user.
5.  **Critical for Realtime Tracking**: Ensure replication is enabled for the `orders` table. Go to Database -> Replication -> Select `orders` and enable inserts/updates.

---

## 2. Environment Variables

Set up the following environment variables in your deployment environment (e.g., Vercel Dashboard -> Settings -> Environment Variables).

```env
# Supabase (Get from Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Required for Admin/Server actions strictly
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id

# Application Settings
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210 # Format with country code, no +

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_URL=your_upstash_rest_url
UPSTASH_REDIS_TOKEN=your_upstash_rest_token

# Admin Settings
ADMIN_SESSION_TIMEOUT_MINUTES=30
```

---

## 3. Deployment Options

### Option A: Vercel (Recommended)

1.  Push your code to a GitHub/GitLab/Bitbucket repository.
2.  Log in to Vercel and click **Add New** -> **Project**.
3.  Import your repository.
4.  Vercel automatically detects Next.js settings.
5.  Open the **Environment Variables** section and paste the list from Step 2.
6.  Click **Deploy**.

### Option B: Custom Node.js Server / VPS (e.g., DigitalOcean, AWS EC2)

1.  Clone your repository to the server.
2.  Create a `.env.production` file with your variables.
3.  Install dependencies: `npm ci`
4.  Build the application: `npm run build`
5.  Start the application using a process manager like PM2:
    ```bash
    npm install -g pm2
    pm2 start npm --name "waffle-store" -- start
    pm2 save
    pm2 startup
    ```
6.  Set up Nginx or Apache as a reverse proxy pointing to `localhost:3000`.

---

## 4. Post-Deployment Checks

1.  **Auth Check**: Try logging into the `/admin/login` page with your seeded admin credentials.
2.  **Checkout Flow**: Place a test order. Verify that Razorpay opens (in test mode if using test keys) and that the order appears in the Supabase `orders` table.
3.  **Realtime Check**: Open the `/admin/orders` page on desktop and the `/track-order/[id]` page on your phone for a recent order. Change the status on the admin dashboard and verify the phone updates instantly without refreshing.
4.  **Webhooks**: Razorpay webhooks are not strictly required because we verify signatures on the client redirect (`/api/payments/verify`), but for high reliability (e.g., user closes tab before redirect), configure a Razorpay Webhook pointing to `https://your-domain.com/api/payments/webhook` listening to `payment.captured` and `order.paid` events. (Note: You will need to build this specific webhook handler if you choose this route, but the current implementation handles it synchronously on checkout success).

---

## 5. Security & Rate Limiting Note

By default, the `rateLimit.ts` utility falls back to an in-memory Map if Redis URLs are not provided.
**You MUST provide `UPSTASH_REDIS_URL` in production.** If you deploy to serverless (like Vercel), in-memory state is lost between requests and instances, meaning your rate limiting (brute force protection, API spam protection) will fail to work globally without Redis.

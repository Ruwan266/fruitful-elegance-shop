# FruitFlix UAE — Setup Guide

## Step 1: Install dependencies
```bash
npm install
```

## Step 2: Set up Supabase (free backend)

1. Go to https://supabase.com and create a free account
2. Click "New Project" → name it "fruitflix"
3. Wait for project to be ready (~1 minute)
4. Go to: SQL Editor → click "New query"
5. Copy the entire contents of `supabase/schema.sql` and paste it → Run
6. Go to: Settings → API
7. Copy your Project URL and both keys
8. Open `.env` and fill in:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_SUPABASE_SERVICE_KEY=eyJ...
   ```

## Step 3: Run locally
```bash
npm run dev
```
→ Open http://localhost:8080

## Step 4: Test admin panel
→ Go to http://localhost:8080/admin
→ Password: FruitFlix2024! (change in .env: VITE_ADMIN_PASSWORD)

## Step 5: Admin features
- Dashboard: Live stats and charts
- Products: Add/edit/delete products
- Orders: View and update order status
- Customers: Customer profiles and history
- Analytics: Revenue and order charts
- Box Builder: Manage custom box items
- Content: Edit homepage text, announcement bar, store info
- Settings: Delivery zones and discount codes

## Step 6: Deploy to Vercel
```bash
git add .
git commit -m "complete admin panel + Supabase backend"
git push
```
Then in Vercel → Settings → Environment Variables:
Add ALL variables from your .env file

## Shopify (for products only)
Your Shopify storefront token still works for displaying products.
The admin panel gives you a SEPARATE way to manage everything.

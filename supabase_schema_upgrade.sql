-- ═══════════════════════════════════════════════════════════════
-- FruitFlix UAE — Complete Supabase Schema
-- Run this entire file in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── 1. CATEGORIES ────────────────────────────────────────────
create table if not exists categories (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  slug        text unique not null,
  image_url   text,
  description text,
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── 2. BOX BUILDER ITEMS ─────────────────────────────────────
create table if not exists box_builder_items (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  price        numeric not null default 0,
  category     text not null default 'fruits',
  image_url    text,
  max_quantity integer default 3,
  description  text,
  is_active    boolean default true,
  sort_order   integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── 3. BOX OPTIONS (ribbons / sizes / colors) ────────────────
create table if not exists box_options (
  id         uuid default gen_random_uuid() primary key,
  type       text not null check (type in ('ribbon','size','color')),
  label      text not null,
  value      text not null,
  extra_price numeric default 0,
  meta       jsonb,           -- e.g. {"maxItems": 6, "basePrice": 25}
  is_active  boolean default true,
  sort_order integer default 0
);

-- Default ribbons
insert into box_options (type, label, value, extra_price, sort_order) values
  ('ribbon', 'Classic Gold',    'classic-gold',    0,  1),
  ('ribbon', 'Satin Red',       'satin-red',        5,  2),
  ('ribbon', 'Forest Green',    'forest-green',     5,  3),
  ('ribbon', 'Pearl White',     'pearl-white',      8,  4),
  ('ribbon', 'Royal Purple',    'royal-purple',     8,  5)
on conflict do nothing;

-- Default sizes
insert into box_options (type, label, value, extra_price, meta, sort_order) values
  ('size', 'Small (S)',  'S', 15, '{"maxItems":4}',  1),
  ('size', 'Medium (M)', 'M', 25, '{"maxItems":6}',  2),
  ('size', 'Large (L)',  'L', 35, '{"maxItems":10}', 3)
on conflict do nothing;

-- Default colors
insert into box_options (type, label, value, extra_price, sort_order) values
  ('color', 'Forest Green', 'Forest Green', 0, 1),
  ('color', 'Gold',         'Gold',         0, 2),
  ('color', 'Cream',        'Cream',        0, 3),
  ('color', 'Berry Red',    'Berry Red',    0, 4)
on conflict do nothing;

-- ─── 4. PRODUCTS ──────────────────────────────────────────────
create table if not exists products (
  id             uuid default gen_random_uuid() primary key,
  title          text not null,
  slug           text unique,
  description    text,
  price          numeric not null default 0,
  compare_price  numeric,
  category       text,
  badge          text,
  images         text[] default '{}',
  sizes          text[] default '{S,M,L}',
  colors         text[] default '{"Forest Green","Gold"}',
  whats_inside   text[] default '{}',
  tags           text[] default '{}',
  sku            text,
  in_stock       boolean default true,
  stock_quantity integer default 999,
  rating         numeric default 4.8,
  review_count   integer default 0,
  is_active      boolean default true,
  sort_order     integer default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── 5. CUSTOMERS ─────────────────────────────────────────────
create table if not exists customers (
  id              uuid default gen_random_uuid() primary key,
  shopify_id      text unique,
  email           text unique not null,
  first_name      text,
  last_name       text,
  phone           text,
  total_orders    integer default 0,
  total_spent     numeric default 0,
  last_order_at   timestamptz,
  is_vip          boolean default false,
  tags            text[] default '{}',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── 6. ORDERS ────────────────────────────────────────────────
create table if not exists orders (
  id                     uuid default gen_random_uuid() primary key,
  order_number           serial,
  customer_id            uuid references customers(id),
  customer_email         text,
  customer_name          text,
  customer_phone         text,
  status                 text default 'pending',
  payment_status         text default 'pending',
  payment_method         text,
  subtotal               numeric default 0,
  shipping_cost          numeric default 0,
  discount               numeric default 0,
  total                  numeric default 0,
  cost_of_goods          numeric default 0,   -- for profit calc
  profit                 numeric generated always as (total - cost_of_goods - shipping_cost) stored,
  shipping_address       jsonb,
  delivery_date          text,
  delivery_slot          text,
  gift_note              text,
  packaging_instructions text,
  occasion               text,
  admin_notes            text,
  source                 text default 'website',
  line_items             jsonb default '[]',
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- ─── 7. CUSTOM BOXES ──────────────────────────────────────────
create table if not exists custom_boxes (
  id               uuid default gen_random_uuid() primary key,
  order_id         uuid references orders(id),
  customer_email   text,
  customer_name    text,
  box_size         text,
  box_color        text,
  ribbon           text,
  items            jsonb default '[]',  -- [{id, name, qty, price}]
  message_text     text,
  message_html     text,
  message_image_url text,
  total_price      numeric default 0,
  status           text default 'pending',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── 8. CONVERSATIONS & MESSAGES ─────────────────────────────
create table if not exists conversations (
  id              uuid default gen_random_uuid() primary key,
  customer_email  text not null,
  customer_name   text,
  custom_box_id   uuid references custom_boxes(id),
  subject         text default 'Custom Box Enquiry',
  status          text default 'open' check (status in ('open','resolved','archived')),
  unread_admin    integer default 0,
  unread_customer integer default 0,
  last_message_at timestamptz default now(),
  created_at      timestamptz default now()
);

create table if not exists messages (
  id               uuid default gen_random_uuid() primary key,
  conversation_id  uuid references conversations(id) on delete cascade,
  sender_type      text not null check (sender_type in ('customer','admin')),
  sender_name      text,
  content          text,
  content_html     text,
  image_url        text,
  is_read          boolean default false,
  created_at       timestamptz default now()
);

-- ─── 9. NOTIFICATIONS ─────────────────────────────────────────
create table if not exists notifications (
  id             uuid default gen_random_uuid() primary key,
  customer_email text not null,
  type           text not null,   -- 'message_reply' | 'order_update' | 'promo'
  title          text not null,
  body           text,
  link           text,
  data           jsonb,
  is_read        boolean default false,
  created_at     timestamptz default now()
);

-- ─── 10. DELIVERY ZONES ───────────────────────────────────────
create table if not exists delivery_zones (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  emirates        text[] default '{}',
  price           numeric default 0,
  free_above      numeric default 200,
  estimated_hours text default '2-4 hours',
  is_active       boolean default true,
  created_at      timestamptz default now()
);

-- ─── 11. DISCOUNT CODES ───────────────────────────────────────
create table if not exists discount_codes (
  id         uuid default gen_random_uuid() primary key,
  code       text unique not null,
  type       text default 'percentage' check (type in ('percentage','fixed')),
  value      numeric not null,
  min_order  numeric default 0,
  uses       integer default 0,
  max_uses   integer,
  is_active  boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─── 12. ANALYTICS (daily + monthly snapshots) ────────────────
create table if not exists analytics_daily (
  id           uuid default gen_random_uuid() primary key,
  date         date unique not null,
  total_orders integer default 0,
  revenue      numeric default 0,
  profit       numeric default 0,
  new_customers integer default 0,
  page_views   integer default 0,
  created_at   timestamptz default now()
);

create table if not exists analytics_monthly (
  id              uuid default gen_random_uuid() primary key,
  year            integer not null,
  month           integer not null,
  total_orders    integer default 0,
  total_revenue   numeric default 0,
  total_cost      numeric default 0,
  total_profit    numeric default 0,
  new_customers   integer default 0,
  avg_order_value numeric default 0,
  created_at      timestamptz default now(),
  unique(year, month)
);

-- ─── 13. STORAGE BUCKETS (run manually in Storage UI) ─────────
-- Create two public buckets in Supabase Storage:
--   • "box-items"    → for box builder item images
--   • "categories"  → for category images
--   • "messages"    → for customer message attachments
-- Set them to PUBLIC so images load without auth tokens.

-- ─── 14. ROW LEVEL SECURITY (basic) ──────────────────────────
alter table notifications enable row level security;
create policy "customers read own notifications"
  on notifications for select
  using (true);   -- tighten with auth.email() = customer_email in production

-- ─── 15. REALTIME (enable for live chat) ──────────────────────
-- In Supabase Dashboard → Database → Replication, enable:
--   messages, notifications, conversations

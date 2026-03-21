-- ============================================================
-- FruitFlix UAE - Complete Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  price numeric(10,2) not null default 0,
  compare_price numeric(10,2),
  category text not null default 'gift-boxes',
  badge text check (badge in ('best-seller','premium','new','limited','sale')),
  images text[] default '{}',
  sizes text[] default '{"S","M","L"}',
  colors text[] default '{"Forest Green","Gold"}',
  whats_inside text[] default '{}',
  tags text[] default '{}',
  sku text,
  in_stock boolean default true,
  stock_quantity integer default 999,
  rating numeric(3,2) default 4.8,
  review_count integer default 0,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── BOX BUILDER ITEMS ────────────────────────────────────────────────────────
create table if not exists box_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  image_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── CUSTOMERS ────────────────────────────────────────────────────────────────
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id) on delete cascade,
  label text default 'Home',
  address_line text,
  city text,
  emirate text default 'Dubai',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number serial,
  customer_id uuid references customers(id),
  customer_email text not null,
  customer_name text,
  customer_phone text,
  status text default 'pending' check (status in ('pending','confirmed','processing','out_for_delivery','delivered','cancelled','refunded')),
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text default 'card',
  subtotal numeric(10,2) default 0,
  shipping_cost numeric(10,2) default 0,
  discount numeric(10,2) default 0,
  total numeric(10,2) default 0,
  shipping_address jsonb,
  delivery_date date,
  delivery_slot text,
  gift_note text,
  packaging_instructions text,
  occasion text,
  admin_notes text,
  source text default 'website',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_title text not null,
  product_image text,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  size text,
  color text,
  custom_items jsonb,
  created_at timestamptz default now()
);

-- ─── CATEGORIES ───────────────────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ─── SITE CONTENT ─────────────────────────────────────────────────────────────
create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ─── ANALYTICS ────────────────────────────────────────────────────────────────
create table if not exists page_views (
  id uuid primary key default uuid_generate_v4(),
  page text not null,
  referrer text,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists analytics_daily (
  date date primary key,
  page_views integer default 0,
  unique_visitors integer default 0,
  orders integer default 0,
  revenue numeric(10,2) default 0,
  updated_at timestamptz default now()
);

-- ─── DISCOUNT CODES ───────────────────────────────────────────────────────────
create table if not exists discount_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type text default 'percentage' check (type in ('percentage','fixed')),
  value numeric(10,2) not null,
  min_order numeric(10,2) default 0,
  max_uses integer,
  used_count integer default 0,
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- ─── DELIVERY ZONES ───────────────────────────────────────────────────────────
create table if not exists delivery_zones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  emirates text[] not null,
  price numeric(10,2) default 0,
  free_above numeric(10,2) default 200,
  estimated_hours text default '2-4 hours',
  is_active boolean default true
);

-- ─── ADMIN USERS ──────────────────────────────────────────────────────────────
create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  name text,
  role text default 'staff' check (role in ('owner','manager','staff')),
  is_active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now()
);

-- ─── UPDATED_AT TRIGGERS ──────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_products_updated before update on products for each row execute function update_updated_at();
create trigger trg_orders_updated before update on orders for each row execute function update_updated_at();
create trigger trg_customers_updated before update on customers for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
alter table products enable row level security;
alter table orders enable row level security;
alter table customers enable row level security;
alter table box_items enable row level security;
alter table categories enable row level security;
alter table site_content enable row level security;
alter table analytics_daily enable row level security;
alter table discount_codes enable row level security;
alter table delivery_zones enable row level security;

-- Public read for products, categories, box_items, site_content, delivery_zones
create policy "Public read products" on products for select using (is_active = true);
create policy "Public read categories" on categories for select using (is_active = true);
create policy "Public read box_items" on box_items for select using (is_active = true);
create policy "Public read site_content" on site_content for select using (true);
create policy "Public read delivery_zones" on delivery_zones for select using (is_active = true);

-- Service role has full access (used by admin panel via service key)
create policy "Service full access products" on products using (true) with check (true);
create policy "Service full access orders" on orders using (true) with check (true);
create policy "Service full access customers" on customers using (true) with check (true);
create policy "Service full access box_items" on box_items using (true) with check (true);
create policy "Service full access categories" on categories using (true) with check (true);
create policy "Service full access site_content" on site_content using (true) with check (true);
create policy "Service full access analytics" on analytics_daily using (true) with check (true);
create policy "Service full access discounts" on discount_codes using (true) with check (true);
create policy "Service full access delivery" on delivery_zones using (true) with check (true);

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

-- Default delivery zones
insert into delivery_zones (name, emirates, price, free_above, estimated_hours) values
('Dubai', '{"Dubai"}', 0, 200, '1-2 hours'),
('Abu Dhabi', '{"Abu Dhabi"}', 20, 300, '2-4 hours'),
('Sharjah & Ajman', '{"Sharjah","Ajman"}', 15, 250, '2-3 hours'),
('Other Emirates', '{"Fujairah","Ras Al Khaimah","Umm Al Quwain"}', 30, 400, '4-6 hours');

-- Default categories
insert into categories (name, slug, sort_order) values
('Fresh Fruits', 'fruits', 1),
('Premium Nuts', 'nuts', 2),
('Fresh Berries', 'berries', 3),
('Luxury Dates', 'dates', 4),
('Gift Boxes', 'gift-boxes', 5),
('Corporate Gifting', 'corporate', 6),
('Healthy Snacks', 'snacks', 7);

-- Default site content
insert into site_content (key, value) values
('hero', '{"title": "Premium Gifts, Delivered with Love", "subtitle": "Luxury fruit boxes, custom gift hampers & premium dates across UAE", "badge": "Same-Day Delivery Available"}'),
('announcement', '{"text": "🎁 Free Delivery on Orders Above AED 200 | Same-Day Delivery Available"}'),
('store_info', '{"name": "FruitFlix UAE", "email": "info@fruitflix-uae.com", "phone": "+971 50 000 0000", "instagram": "@fruitflixuae", "whatsapp": "+971500000000"}');

-- Default box builder items
insert into box_items (name, category, price, sort_order) values
('Alphonso Mango', 'fruits', 25, 1),
('Strawberries (250g)', 'fruits', 18, 2),
('Red Grapes', 'fruits', 15, 3),
('Kiwi Fruit', 'fruits', 12, 4),
('Dragon Fruit', 'fruits', 22, 5),
('Avocado', 'fruits', 14, 6),
('Cashew Nuts (200g)', 'nuts', 22, 7),
('Almonds (200g)', 'nuts', 20, 8),
('Pistachios (150g)', 'nuts', 28, 9),
('Walnuts (200g)', 'nuts', 24, 10),
('Mixed Nuts', 'nuts', 26, 11),
('Blueberries (125g)', 'berries', 20, 12),
('Raspberries (125g)', 'berries', 22, 13),
('Blackberries (125g)', 'berries', 20, 14),
('Medjool Dates (250g)', 'dates', 30, 15),
('Ajwa Dates (250g)', 'dates', 35, 16),
('Sukkari Dates (250g)', 'dates', 28, 17),
('Chocolate-Coated Dates', 'dates', 38, 18),
('Dark Chocolate Bar', 'extras', 15, 19),
('Ferrero Rocher (4 pcs)', 'extras', 25, 20),
('Honey Jar (250g)', 'extras', 30, 21),
('Dried Mango', 'extras', 18, 22),
('Greeting Card', 'extras', 10, 23),
('Luxury Ribbon', 'extras', 8, 24);

-- Default discount code
insert into discount_codes (code, type, value, min_order) values ('FRUITFLIX10', 'percentage', 10, 100);

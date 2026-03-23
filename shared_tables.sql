-- ============================================================
-- FruitFlix UAE — Shared Data Tables
-- Run this in Supabase SQL Editor
-- These tables store JSON data (including base64 images as text)
-- so NO Supabase Storage buckets are needed.
-- ============================================================

-- ─── APP CATEGORIES (with base64 image support) ──────────────────────────────
create table if not exists app_categories (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  slug        text unique not null,
  description text default '',
  image       text default '',   -- base64 data URL stored as text
  sort_order  integer default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── BOX BUILDER ITEMS (with base64 image support) ───────────────────────────
create table if not exists app_box_items (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  category     text not null default 'fruits',
  price        numeric(10,2) not null default 0,
  image        text default '',   -- base64 data URL stored as text
  max_quantity integer default 3,
  description  text default '',
  is_active    boolean default true,
  sort_order   integer default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─── OFFERS / PROMOTIONS (with base64 image support) ─────────────────────────
create table if not exists app_offers (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  subtitle      text default '',
  badge         text default '',
  discount_text text default '',
  image         text default '',   -- base64 data URL stored as text
  link          text default '/shop',
  bg_color      text default '#2d5a27',
  is_active     boolean default true,
  sort_order    integer default 0,
  expires_at    text default '',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── DELIVERY OPTIONS ────────────────────────────────────────────────────────
create table if not exists app_delivery_options (
  id             text primary key default gen_random_uuid()::text,
  name           text not null,
  description    text default '',
  price          numeric(10,2) default 0,
  estimated_time text default '',
  icon           text default '🚚',
  is_active      boolean default true,
  sort_order     integer default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── BOX BUILDER MESSAGES (from customers) ───────────────────────────────────
create table if not exists app_box_messages (
  id             text primary key default gen_random_uuid()::text,
  customer_name  text default 'Guest',
  customer_email text default '',
  message        text default '',
  image          text default '',   -- base64 data URL stored as text
  box_details    jsonb default '{}',
  read           boolean default false,
  created_at     timestamptz default now()
);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_app_categories_updated
  before update on app_categories
  for each row execute function update_updated_at();

create trigger trg_app_box_items_updated
  before update on app_box_items
  for each row execute function update_updated_at();

create trigger trg_app_offers_updated
  before update on app_offers
  for each row execute function update_updated_at();

create trigger trg_app_delivery_updated
  before update on app_delivery_options
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table app_categories       enable row level security;
alter table app_box_items        enable row level security;
alter table app_offers           enable row level security;
alter table app_delivery_options enable row level security;
alter table app_box_messages     enable row level security;

-- Public can read active data (frontend)
create policy "Public read app_categories"       on app_categories       for select using (is_active = true);
create policy "Public read app_box_items"        on app_box_items        for select using (is_active = true);
create policy "Public read app_offers"           on app_offers           for select using (is_active = true);
create policy "Public read app_delivery_options" on app_delivery_options for select using (is_active = true);

-- Customers can insert messages
create policy "Public insert app_box_messages"   on app_box_messages     for insert with check (true);

-- Service role (admin panel via service key) has full access
create policy "Service full app_categories"       on app_categories       using (true) with check (true);
create policy "Service full app_box_items"        on app_box_items        using (true) with check (true);
create policy "Service full app_offers"           on app_offers           using (true) with check (true);
create policy "Service full app_delivery_options" on app_delivery_options using (true) with check (true);
create policy "Service full app_box_messages"     on app_box_messages     using (true) with check (true);

-- ─── SEED DEFAULT DATA ────────────────────────────────────────────────────────

insert into app_categories (name, slug, description, sort_order) values
  ('Fresh Fruits',       'fruits',     'Seasonal fresh fruits',           1),
  ('Premium Nuts',       'nuts',       'Hand-picked premium nuts',        2),
  ('Fresh Berries',      'berries',    'Freshly sourced berries',         3),
  ('Luxury Dates',       'dates',      'Finest Medjool and Ajwa dates',   4),
  ('Gift Boxes',         'gift-boxes', 'Curated luxury gift boxes',       5),
  ('Corporate Gifting',  'corporate',  'Bulk corporate gifts',            6),
  ('Healthy Snacks',     'snacks',     'Guilt-free premium snacks',       7)
on conflict (slug) do nothing;

insert into app_box_items (name, category, price, max_quantity, sort_order) values
  ('Alphonso Mango',        'fruits',  25, 3, 1),
  ('Strawberries (250g)',   'fruits',  18, 3, 2),
  ('Cashew Nuts (200g)',    'nuts',    22, 3, 3),
  ('Almonds (200g)',        'nuts',    20, 3, 4),
  ('Blueberries (125g)',    'berries', 20, 2, 5),
  ('Medjool Dates (250g)',  'dates',   30, 2, 6),
  ('Ferrero Rocher (4 pcs)','extras',  25, 3, 7),
  ('Greeting Card',         'extras',  10, 1, 8)
on conflict do nothing;

insert into app_offers (title, subtitle, discount_text, link, bg_color, sort_order) values
  ('Ramadan Special',    'Premium date boxes beautifully wrapped', 'Up to 20% OFF', '/shop?category=dates',     '#2d5a27', 1),
  ('Corporate Gifting',  'Bulk orders for teams & clients',        'From AED 150',  '/shop?category=corporate', '#8B6914', 2)
on conflict do nothing;

insert into app_delivery_options (name, description, price, estimated_time, icon, sort_order) values
  ('Same-Day Delivery',    'Order before 2 PM for delivery today', 0,  '2-4 hours',              '⚡', 1),
  ('Next-Day Delivery',    'Delivered tomorrow by noon',           0,  'Next day before 12 PM',  '🚚', 2),
  ('Scheduled Delivery',   'Pick your preferred date & time',      15, 'Your chosen slot',       '📅', 3),
  ('Express (2 Hours)',    'Priority rush delivery',               35, '~2 hours',               '🏎️', 4)
on conflict do nothing;

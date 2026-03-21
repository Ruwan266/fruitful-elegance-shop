import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

// Public client - for frontend (respects Row Level Security)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Admin client - bypasses RLS (only use in admin panel)
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || supabaseAnonKey || '',
  { auth: { persistSession: false } }
);

export type Database = {
  products: {
    id: string; title: string; slug: string; description: string;
    price: number; compare_price: number | null; category: string;
    badge: string | null; images: string[]; sizes: string[];
    colors: string[]; whats_inside: string[]; tags: string[];
    sku: string; in_stock: boolean; stock_quantity: number;
    rating: number; review_count: number; is_active: boolean;
    sort_order: number; created_at: string; updated_at: string;
  };
  orders: {
    id: string; order_number: number; customer_email: string;
    customer_name: string; customer_phone: string; status: string;
    payment_status: string; payment_method: string;
    subtotal: number; shipping_cost: number; discount: number; total: number;
    shipping_address: any; delivery_date: string; delivery_slot: string;
    gift_note: string; packaging_instructions: string; occasion: string;
    admin_notes: string; source: string; created_at: string; updated_at: string;
  };
};

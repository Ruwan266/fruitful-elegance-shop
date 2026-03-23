// ─── FruitFlix Shared Store ───────────────────────────────────────────────────
// Uses Supabase so ALL admins and users see the same data.
// Images are stored as base64 text directly in the DB — no Storage buckets needed.

import { supabase, supabaseAdmin } from "@/lib/supabase";

// ─── Image Helper ─────────────────────────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort_order: number;
  is_active: boolean;
}

export interface BoxItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  max_quantity: number;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  discount_text: string;
  image: string;
  link: string;
  bg_color: string;
  is_active: boolean;
  sort_order: number;
  expires_at: string;
}

export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_time: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export interface BoxMessage {
  id: string;
  customer_name: string;
  customer_email: string;
  message: string;
  image: string;
  box_details: {
    size: string;
    color: string;
    ribbon: string;
    items: { name: string; qty: number; price: number }[];
    total: number;
  };
  created_at: string;
  read: boolean;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(activeOnly = true): Promise<Category[]> {
  let q = supabase.from("app_categories").select("*").order("sort_order").order("name");
  if (activeOnly) q = q.eq("is_active", true);
  const { data } = await q;
  return (data || []) as Category[];
}

export async function getAllCategories(): Promise<Category[]> {
  const { data } = await supabaseAdmin
    .from("app_categories").select("*").order("sort_order").order("name");
  return (data || []) as Category[];
}

export async function upsertCategory(cat: Partial<Category> & { id?: string }): Promise<void> {
  if (cat.id) {
    await supabaseAdmin.from("app_categories").update(cat).eq("id", cat.id);
  } else {
    await supabaseAdmin.from("app_categories").insert({ id: genId(), ...cat });
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await supabaseAdmin.from("app_categories").delete().eq("id", id);
}

// ─── Box Items ────────────────────────────────────────────────────────────────

export async function getBoxItems(activeOnly = true): Promise<BoxItem[]> {
  let q = supabase.from("app_box_items").select("*").order("sort_order").order("name");
  if (activeOnly) q = q.eq("is_active", true);
  const { data } = await q;
  return (data || []) as BoxItem[];
}

export async function getAllBoxItems(): Promise<BoxItem[]> {
  const { data } = await supabaseAdmin
    .from("app_box_items").select("*").order("sort_order").order("name");
  return (data || []) as BoxItem[];
}

export async function upsertBoxItem(item: Partial<BoxItem> & { id?: string }): Promise<void> {
  if (item.id) {
    await supabaseAdmin.from("app_box_items").update(item).eq("id", item.id);
  } else {
    await supabaseAdmin.from("app_box_items").insert({ id: genId(), ...item });
  }
}

export async function deleteBoxItem(id: string): Promise<void> {
  await supabaseAdmin.from("app_box_items").delete().eq("id", id);
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export async function getOffers(activeOnly = true): Promise<Offer[]> {
  let q = supabase.from("app_offers").select("*").order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data } = await q;
  return (data || []) as Offer[];
}

export async function getAllOffers(): Promise<Offer[]> {
  const { data } = await supabaseAdmin.from("app_offers").select("*").order("sort_order");
  return (data || []) as Offer[];
}

export async function upsertOffer(offer: Partial<Offer> & { id?: string }): Promise<void> {
  if (offer.id) {
    await supabaseAdmin.from("app_offers").update(offer).eq("id", offer.id);
  } else {
    await supabaseAdmin.from("app_offers").insert({ id: genId(), ...offer });
  }
}

export async function deleteOffer(id: string): Promise<void> {
  await supabaseAdmin.from("app_offers").delete().eq("id", id);
}

// ─── Delivery Options ─────────────────────────────────────────────────────────

export async function getDeliveryOptions(activeOnly = true): Promise<DeliveryOption[]> {
  let q = supabase.from("app_delivery_options").select("*").order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data } = await q;
  return (data || []) as DeliveryOption[];
}

export async function getAllDeliveryOptions(): Promise<DeliveryOption[]> {
  const { data } = await supabaseAdmin
    .from("app_delivery_options").select("*").order("sort_order");
  return (data || []) as DeliveryOption[];
}

export async function upsertDeliveryOption(opt: Partial<DeliveryOption> & { id?: string }): Promise<void> {
  if (opt.id) {
    await supabaseAdmin.from("app_delivery_options").update(opt).eq("id", opt.id);
  } else {
    await supabaseAdmin.from("app_delivery_options").insert({ id: genId(), ...opt });
  }
}

export async function deleteDeliveryOption(id: string): Promise<void> {
  await supabaseAdmin.from("app_delivery_options").delete().eq("id", id);
}

// ─── Box Messages ─────────────────────────────────────────────────────────────

export async function getBoxMessages(): Promise<BoxMessage[]> {
  const { data } = await supabaseAdmin
    .from("app_box_messages").select("*").order("created_at", { ascending: false });
  return (data || []) as BoxMessage[];
}

export async function insertBoxMessage(msg: Omit<BoxMessage, "id" | "created_at">): Promise<void> {
  await supabase.from("app_box_messages").insert({ id: genId(), ...msg });
}

export async function markBoxMessageRead(id: string): Promise<void> {
  await supabaseAdmin.from("app_box_messages").update({ read: true }).eq("id", id);
}

export async function deleteBoxMessage(id: string): Promise<void> {
  await supabaseAdmin.from("app_box_messages").delete().eq("id", id);
}

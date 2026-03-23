import { supabase, supabaseAdmin } from "@/lib/supabase";

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

function throwIfError(error: any, context: string) {
  if (error) {
    console.error(`[sharedStore] ${context}:`, error);
    throw new Error(error.message || `Failed: ${context}`);
  }
}

export interface Category {
  id: string; name: string; slug: string; description: string;
  image: string; sort_order: number; is_active: boolean;
}

export interface BoxItem {
  id: string; name: string; category: string; price: number;
  image: string; max_quantity: number; description: string;
  is_active: boolean; sort_order: number;
}

export interface Offer {
  id: string; title: string; subtitle: string; badge: string;
  discount_text: string; image: string; link: string; bg_color: string;
  is_active: boolean; sort_order: number; expires_at: string;
}

export interface DeliveryOption {
  id: string; name: string; description: string; price: number;
  estimated_time: string; icon: string; is_active: boolean; sort_order: number;
}

export interface BoxMessage {
  id: string; customer_name: string; customer_email: string;
  message: string; image: string;
  box_details: { size: string; color: string; ribbon: string; items: { name: string; qty: number; price: number }[]; total: number; };
  created_at: string; read: boolean;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(activeOnly = true): Promise<Category[]> {
  let q = supabase.from("app_categories").select("*").order("sort_order").order("name");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  throwIfError(error, "getCategories");
  return (data || []) as Category[];
}

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin.from("app_categories").select("*").order("sort_order").order("name");
  throwIfError(error, "getAllCategories");
  return (data || []) as Category[];
}

export async function upsertCategory(cat: Partial<Category> & { id?: string }): Promise<void> {
  if (cat.id) {
    const { error } = await supabaseAdmin.from("app_categories").update(cat).eq("id", cat.id);
    throwIfError(error, "updateCategory");
  } else {
    const { error } = await supabaseAdmin.from("app_categories").insert({ id: genId(), ...cat });
    throwIfError(error, "insertCategory");
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("app_categories").delete().eq("id", id);
  throwIfError(error, "deleteCategory");
}

// ─── Box Items ────────────────────────────────────────────────────────────────

export async function getBoxItems(activeOnly = true): Promise<BoxItem[]> {
  let q = supabase.from("app_box_items").select("*").order("sort_order").order("name");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  throwIfError(error, "getBoxItems");
  return (data || []) as BoxItem[];
}

export async function getAllBoxItems(): Promise<BoxItem[]> {
  const { data, error } = await supabaseAdmin.from("app_box_items").select("*").order("sort_order").order("name");
  throwIfError(error, "getAllBoxItems");
  return (data || []) as BoxItem[];
}

export async function upsertBoxItem(item: Partial<BoxItem> & { id?: string }): Promise<void> {
  if (item.id) {
    const { error } = await supabaseAdmin.from("app_box_items").update(item).eq("id", item.id);
    throwIfError(error, "updateBoxItem");
  } else {
    const { error } = await supabaseAdmin.from("app_box_items").insert({ id: genId(), ...item });
    throwIfError(error, "insertBoxItem");
  }
}

export async function deleteBoxItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("app_box_items").delete().eq("id", id);
  throwIfError(error, "deleteBoxItem");
}

// ─── Offers ───────────────────────────────────────────────────────────────────

export async function getOffers(activeOnly = true): Promise<Offer[]> {
  let q = supabase.from("app_offers").select("*").order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  throwIfError(error, "getOffers");
  return (data || []) as Offer[];
}

export async function getAllOffers(): Promise<Offer[]> {
  const { data, error } = await supabaseAdmin.from("app_offers").select("*").order("sort_order");
  throwIfError(error, "getAllOffers");
  return (data || []) as Offer[];
}

export async function upsertOffer(offer: Partial<Offer> & { id?: string }): Promise<void> {
  if (offer.id) {
    const { error } = await supabaseAdmin.from("app_offers").update(offer).eq("id", offer.id);
    throwIfError(error, "updateOffer");
  } else {
    const { error } = await supabaseAdmin.from("app_offers").insert({ id: genId(), ...offer });
    throwIfError(error, "insertOffer");
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("app_offers").delete().eq("id", id);
  throwIfError(error, "deleteOffer");
}

// ─── Delivery Options ─────────────────────────────────────────────────────────

export async function getDeliveryOptions(activeOnly = true): Promise<DeliveryOption[]> {
  let q = supabase.from("app_delivery_options").select("*").order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data, error } = await q;
  throwIfError(error, "getDeliveryOptions");
  return (data || []) as DeliveryOption[];
}

export async function getAllDeliveryOptions(): Promise<DeliveryOption[]> {
  const { data, error } = await supabaseAdmin.from("app_delivery_options").select("*").order("sort_order");
  throwIfError(error, "getAllDeliveryOptions");
  return (data || []) as DeliveryOption[];
}

export async function upsertDeliveryOption(opt: Partial<DeliveryOption> & { id?: string }): Promise<void> {
  if (opt.id) {
    const { error } = await supabaseAdmin.from("app_delivery_options").update(opt).eq("id", opt.id);
    throwIfError(error, "updateDeliveryOption");
  } else {
    const { error } = await supabaseAdmin.from("app_delivery_options").insert({ id: genId(), ...opt });
    throwIfError(error, "insertDeliveryOption");
  }
}

export async function deleteDeliveryOption(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("app_delivery_options").delete().eq("id", id);
  throwIfError(error, "deleteDeliveryOption");
}

// ─── Box Messages ─────────────────────────────────────────────────────────────

export async function getBoxMessages(): Promise<BoxMessage[]> {
  const { data, error } = await supabaseAdmin.from("app_box_messages").select("*").order("created_at", { ascending: false });
  throwIfError(error, "getBoxMessages");
  return (data || []) as BoxMessage[];
}

export async function insertBoxMessage(msg: Omit<BoxMessage, "id" | "created_at">): Promise<void> {
  const { error } = await supabase.from("app_box_messages").insert({ id: genId(), ...msg });
  throwIfError(error, "insertBoxMessage");
}

export async function markBoxMessageRead(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("app_box_messages").update({ read: true }).eq("id", id);
  throwIfError(error, "markBoxMessageRead");
}

export async function deleteBoxMessage(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("app_box_messages").delete().eq("id", id);
  throwIfError(error, "deleteBoxMessage");
}

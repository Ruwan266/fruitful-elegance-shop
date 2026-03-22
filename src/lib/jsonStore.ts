// ─── FruitFlix JSON Store ────────────────────────────────────────────────────
// All data is stored in localStorage as JSON. Images are stored as base64 data URLs.
// This removes the need for any external database or storage service.

const PREFIX = "ff_";

function key(name: string) {
  return PREFIX + name;
}

export function getStore<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStore<T>(name: string, value: T): void {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
  } catch (e) {
    console.error("jsonStore: failed to save", name, e);
  }
}

export function removeStore(name: string): void {
  localStorage.removeItem(key(name));
}

// ─── Image Helpers ────────────────────────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string; // base64 data URL or empty
  sort_order: number;
  is_active: boolean;
}

export interface BoxItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string; // base64 data URL or empty
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
  image: string; // base64 data URL or empty
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
  image: string; // base64 data URL or empty
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

// ─── Store Keys ───────────────────────────────────────────────────────────────

export const KEYS = {
  CATEGORIES: "categories",
  BOX_ITEMS: "box_items",
  OFFERS: "offers",
  DELIVERY_OPTIONS: "delivery_options",
  BOX_MESSAGES: "box_messages",
};

// ─── Seed Defaults ────────────────────────────────────────────────────────────

export function seedDefaults() {
  // Categories (only seed if empty)
  if (getStore<Category[]>(KEYS.CATEGORIES, []).length === 0) {
    const defaults: Category[] = [
      { id: "1", name: "Fresh Fruits", slug: "fruits", description: "Seasonal fresh fruits", image: "", sort_order: 1, is_active: true },
      { id: "2", name: "Premium Nuts", slug: "nuts", description: "Hand-picked premium nuts", image: "", sort_order: 2, is_active: true },
      { id: "3", name: "Fresh Berries", slug: "berries", description: "Freshly sourced berries", image: "", sort_order: 3, is_active: true },
      { id: "4", name: "Luxury Dates", slug: "dates", description: "Finest Medjool and Ajwa dates", image: "", sort_order: 4, is_active: true },
      { id: "5", name: "Gift Boxes", slug: "gift-boxes", description: "Curated luxury gift boxes", image: "", sort_order: 5, is_active: true },
      { id: "6", name: "Corporate Gifting", slug: "corporate", description: "Bulk corporate gifts", image: "", sort_order: 6, is_active: true },
      { id: "7", name: "Healthy Snacks", slug: "snacks", description: "Guilt-free premium snacks", image: "", sort_order: 7, is_active: true },
    ];
    setStore(KEYS.CATEGORIES, defaults);
  }

  // Box Items
  if (getStore<BoxItem[]>(KEYS.BOX_ITEMS, []).length === 0) {
    const defaults: BoxItem[] = [
      { id: "b1", name: "Alphonso Mango", category: "fruits", price: 25, image: "", max_quantity: 3, description: "Premium Indian mangoes", is_active: true, sort_order: 1 },
      { id: "b2", name: "Strawberries (250g)", category: "fruits", price: 18, image: "", max_quantity: 3, description: "Fresh California strawberries", is_active: true, sort_order: 2 },
      { id: "b3", name: "Cashew Nuts (200g)", category: "nuts", price: 22, image: "", max_quantity: 3, description: "Premium roasted cashews", is_active: true, sort_order: 7 },
      { id: "b4", name: "Almonds (200g)", category: "nuts", price: 20, image: "", max_quantity: 3, description: "Raw premium almonds", is_active: true, sort_order: 8 },
      { id: "b5", name: "Blueberries (125g)", category: "berries", price: 20, image: "", max_quantity: 2, description: "Fresh blueberries", is_active: true, sort_order: 12 },
      { id: "b6", name: "Medjool Dates (250g)", category: "dates", price: 30, image: "", max_quantity: 2, description: "Premium Medjool dates", is_active: true, sort_order: 15 },
      { id: "b7", name: "Ferrero Rocher (4 pcs)", category: "extras", price: 25, image: "", max_quantity: 3, description: "Classic chocolate gift", is_active: true, sort_order: 20 },
      { id: "b8", name: "Greeting Card", category: "extras", price: 10, image: "", max_quantity: 1, description: "Personalised greeting card", is_active: true, sort_order: 23 },
    ];
    setStore(KEYS.BOX_ITEMS, defaults);
  }

  // Delivery Options
  if (getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, []).length === 0) {
    const defaults: DeliveryOption[] = [
      { id: "d1", name: "Same-Day Delivery", description: "Order before 2 PM for delivery today", price: 0, estimated_time: "2-4 hours", icon: "⚡", is_active: true, sort_order: 1 },
      { id: "d2", name: "Next-Day Delivery", description: "Delivered tomorrow by noon", price: 0, estimated_time: "Next day before 12 PM", icon: "🚚", is_active: true, sort_order: 2 },
      { id: "d3", name: "Scheduled Delivery", description: "Pick your preferred date & time", price: 15, estimated_time: "Your chosen slot", icon: "📅", is_active: true, sort_order: 3 },
      { id: "d4", name: "Express (2 Hours)", description: "Priority rush delivery", price: 35, estimated_time: "~2 hours", icon: "🏎️", is_active: true, sort_order: 4 },
    ];
    setStore(KEYS.DELIVERY_OPTIONS, defaults);
  }

  // Offers
  if (getStore<Offer[]>(KEYS.OFFERS, []).length === 0) {
    const defaults: Offer[] = [
      {
        id: "o1", title: "Ramadan Special", subtitle: "Premium date boxes beautifully wrapped", badge: "Limited Time",
        discount_text: "Up to 20% OFF", image: "", link: "/shop?category=dates",
        bg_color: "#2d5a27", is_active: true, sort_order: 1, expires_at: "",
      },
      {
        id: "o2", title: "Corporate Gifting", subtitle: "Bulk orders for teams & clients", badge: "Free Delivery",
        discount_text: "From AED 150", image: "", link: "/shop?category=corporate",
        bg_color: "#8B6914", is_active: true, sort_order: 2, expires_at: "",
      },
    ];
    setStore(KEYS.OFFERS, defaults);
  }
}

// ─── ID Generator ─────────────────────────────────────────────────────────────

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

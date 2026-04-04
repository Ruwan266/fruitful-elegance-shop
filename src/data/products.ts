import fruitsImg from "@/assets/fruits-collection.jpg";
import nutsImg from "@/assets/nuts-collection.jpg";
import datesImg from "@/assets/dates-collection.jpg";
import berriesImg from "@/assets/berries-collection.jpg";
import giftboxImg from "@/assets/giftbox-collection.jpg";
import corporateImg from "@/assets/corporate-gifting.jpg";
import snacksImg from "@/assets/snacks-collection.jpg";

export interface Product {
  id: string;
  shopifyId?: string;
  variantId?: string;
  handle?: string;
  title: string;
  price: number;
  comparePrice?: number;
  image: string;
  images: string[];
  category: string;
  badge?: "best-seller" | "premium" | "new" | "limited" | "sale";
  rating: number;
  reviewCount: number;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sku: string;
  tags: string[];
  whatsInside?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export const categories = [
  { id: "fruits", name: "Fresh Fruits", image: fruitsImg, count: 24 },
  { id: "nuts", name: "Premium Nuts", image: nutsImg, count: 18 },
  { id: "berries", name: "Fresh Berries", image: berriesImg, count: 12 },
  { id: "dates", name: "Luxury Dates", image: datesImg, count: 15 },
  { id: "gift-boxes", name: "Gift Boxes", image: giftboxImg, count: 20 },
  { id: "corporate", name: "Corporate Gifting", image: corporateImg, count: 10 },
  { id: "snacks", name: "Healthy Snacks", image: snacksImg, count: 16 },
];

export const products: Product[] = [
  // ─── Luxury Fresh Fruits Gift Box – Small ───────────────────────
  {
    id: "9",
    title: "Luxury Fresh Fruits Gift Box – Small",
    price: 179,           // ← sale price
    comparePrice: 199,    // ← original price (strikethrough)
    image: giftboxImg,
    images: [giftboxImg, fruitsImg],
    category: "gift-boxes",
    badge: "sale",
    rating: 4.8,
    reviewCount: 56,
    description: "A beautifully curated small gift box filled with hand-picked premium fresh fruits, elegantly wrapped for gifting across the UAE.",
    sizes: ["S"],
    colors: ["Forest Green", "Gold", "Cream"],
    inStock: true,
    sku: "FF-GB-SM-001",
    tags: ["gift", "fruits", "small", "sale"],
    whatsInside: ["Seasonal Premium Fruits", "Gift Ribbon", "Handwritten Card"],
  },

  // ─── Luxury Fresh Fruits Gift Box – Medium ──────────────────────
  {
    id: "10",
    title: "Luxury Fresh Fruits Gift Box – Medium",
    price: 249,           // ← sale price
    comparePrice: 299,    // ← original price (strikethrough)
    image: giftboxImg,
    images: [giftboxImg, fruitsImg, berriesImg],
    category: "gift-boxes",
    badge: "sale",
    rating: 4.9,
    reviewCount: 74,
    description: "A generous medium gift box featuring a premium selection of exotic fruits, artfully arranged and wrapped in our signature style.",
    sizes: ["M"],
    colors: ["Forest Green", "Gold", "Cream"],
    inStock: true,
    sku: "FF-GB-MD-001",
    tags: ["gift", "fruits", "medium", "sale"],
    whatsInside: ["Hand-picked Exotic Fruits", "Seasonal Berries", "Premium Ribbon", "Gift Card"],
  },

  // ─── Luxury Fresh Fruits Gift Box – Large ───────────────────────
  {
    id: "11",
    title: "Luxury Fresh Fruits Gift Box – Large",
    price: 360,           // ← sale price
    comparePrice: 450,    // ← original price (strikethrough)
    image: giftboxImg,
    images: [giftboxImg, fruitsImg, nutsImg, berriesImg],
    category: "gift-boxes",
    badge: "sale",
    rating: 5.0,
    reviewCount: 42,
    description: "Our grandest gift box — overflowing with the finest seasonal fruits, luxury dates, and premium nuts. The ultimate gift for any occasion.",
    sizes: ["L"],
    colors: ["Forest Green", "Gold", "Cream"],
    inStock: true,
    sku: "FF-GB-LG-001",
    tags: ["gift", "fruits", "large", "premium", "sale"],
    whatsInside: ["Premium Exotic Fruits", "Medjool Dates", "Mixed Nuts", "Artisan Chocolates", "Gold Ribbon", "Gift Card"],
  },

  // ─── Existing products ───────────────────────────────────────────
  {
    id: "1", title: "Royal Fruit & Nut Gift Box", price: 299, comparePrice: 399,
    image: giftboxImg, images: [giftboxImg, fruitsImg, nutsImg],
    category: "gift-boxes", badge: "best-seller", rating: 4.9, reviewCount: 128,
    description: "An exquisite collection of hand-picked premium fruits and finest nuts, beautifully arranged in our signature luxury box.",
    sizes: ["S", "M", "L"], colors: ["Forest Green", "Gold", "Cream"],
    inStock: true, sku: "FF-GB-001", tags: ["gifting", "premium", "bestseller"],
    whatsInside: ["Hand-picked Mangoes", "Premium Strawberries", "Medjool Dates", "Cashew Nuts", "Walnuts"],
  },
  {
    id: "2", title: "Premium Medjool Dates Box", price: 189,
    image: datesImg, images: [datesImg, giftboxImg],
    category: "dates", badge: "premium", rating: 4.8, reviewCount: 95,
    description: "Finest Medjool dates sourced from the best farms, presented in an elegant gold gift box.",
    sizes: ["S", "M", "L"], colors: ["Gold", "Cream"],
    inStock: true, sku: "FF-DT-001", tags: ["dates", "premium", "organic"],
    whatsInside: ["Medjool Dates - 500g", "Handwritten Gift Card", "Premium Packaging"],
  },
  {
    id: "3", title: "Fresh Berry Bliss Collection", price: 159, comparePrice: 199,
    image: berriesImg, images: [berriesImg, fruitsImg],
    category: "berries", badge: "new", rating: 4.7, reviewCount: 64,
    description: "A vibrant mix of the freshest strawberries, blueberries, raspberries and blackberries.",
    sizes: ["S", "M", "L"], colors: ["Cream", "Forest Green"],
    inStock: true, sku: "FF-BR-001", tags: ["berries", "fresh", "healthy"],
    whatsInside: ["Strawberries", "Blueberries", "Raspberries", "Blackberries"],
  },
  {
    id: "4", title: "Mixed Nuts Luxury Assortment", price: 229,
    image: nutsImg, images: [nutsImg, giftboxImg],
    category: "nuts", badge: "best-seller", rating: 4.9, reviewCount: 112,
    description: "A premium assortment of roasted and raw nuts including almonds, cashews, pistachios and walnuts.",
    sizes: ["S", "M", "L"], colors: ["Gold", "Cream", "Forest Green"],
    inStock: true, sku: "FF-NT-001", tags: ["nuts", "healthy", "premium"],
    whatsInside: ["Almonds", "Cashews", "Pistachios", "Walnuts", "Macadamia"],
  },
  {
    id: "5", title: "Tropical Fruit Paradise Box", price: 279,
    image: fruitsImg, images: [fruitsImg, giftboxImg],
    category: "fruits", badge: "limited", rating: 4.8, reviewCount: 78,
    description: "An exotic selection of tropical fruits - ripe mangoes, sweet pineapple, juicy kiwi and more.",
    sizes: ["M", "L"], colors: ["Forest Green", "Gold"],
    inStock: true, sku: "FF-FR-001", tags: ["fruits", "tropical", "gift"],
    whatsInside: ["Alphonso Mangoes", "Golden Pineapple", "Kiwi Fruit", "Dragon Fruit"],
  },
  {
    id: "6", title: "Corporate Wellness Hamper", price: 499, comparePrice: 599,
    image: corporateImg, images: [corporateImg, nutsImg, datesImg],
    category: "corporate", badge: "premium", rating: 5.0, reviewCount: 45,
    description: "The ultimate corporate gift. A lavish hamper combining premium fruits, gourmet nuts, artisan dates and luxury treats.",
    sizes: ["L"], colors: ["Gold", "Forest Green"],
    inStock: true, sku: "FF-CP-001", tags: ["corporate", "premium", "customizable"],
    whatsInside: ["Seasonal Fruits", "Premium Nuts Mix", "Medjool Dates", "Dark Chocolate", "Honey"],
  },
  {
    id: "7", title: "Healthy Snack Discovery Box", price: 149,
    image: snacksImg, images: [snacksImg, nutsImg],
    category: "snacks", badge: "new", rating: 4.6, reviewCount: 38,
    description: "A curated selection of wholesome, guilt-free snacks. Trail mixes, granola, energy bars and dried fruits.",
    sizes: ["S", "M"], colors: ["Cream"],
    inStock: true, sku: "FF-SN-001", tags: ["snacks", "healthy", "organic"],
    whatsInside: ["Trail Mix", "Granola Clusters", "Energy Bars", "Dried Mango"],
  },
  {
    id: "8", title: "Signature Fruit Gift Box", price: 349, comparePrice: 449,
    image: giftboxImg, images: [giftboxImg, fruitsImg, berriesImg],
    category: "gift-boxes", badge: "sale", rating: 4.8, reviewCount: 89,
    description: "Our signature gift box featuring the finest seasonal fruits, hand-arranged with care.",
    sizes: ["S", "M", "L"], colors: ["Forest Green", "Gold", "Cream"],
    inStock: true, sku: "FF-GB-002", tags: ["gift", "signature", "seasonal"],
    whatsInside: ["Seasonal Premium Fruits", "Artisan Chocolates", "Gift Note", "Premium Ribbon"],
  },
];

export const boxBuilderItems = [
  { id: "b1", name: "Alphonso Mango", price: 25, category: "fruits", image: fruitsImg },
  { id: "b2", name: "Strawberries (250g)", price: 18, category: "fruits", image: berriesImg },
  { id: "b3", name: "Red Grapes", price: 15, category: "fruits", image: fruitsImg },
  { id: "b4", name: "Kiwi Fruit", price: 12, category: "fruits", image: fruitsImg },
  { id: "b5", name: "Cashew Nuts (200g)", price: 22, category: "nuts", image: nutsImg },
  { id: "b6", name: "Almonds (200g)", price: 20, category: "nuts", image: nutsImg },
  { id: "b7", name: "Pistachios (150g)", price: 28, category: "nuts", image: nutsImg },
  { id: "b8", name: "Walnuts (200g)", price: 24, category: "nuts", image: nutsImg },
  { id: "b9", name: "Medjool Dates (250g)", price: 30, category: "dates", image: datesImg },
  { id: "b10", name: "Blueberries (125g)", price: 20, category: "berries", image: berriesImg },
  { id: "b11", name: "Raspberries (125g)", price: 22, category: "berries", image: berriesImg },
  { id: "b12", name: "Dark Chocolate Bar", price: 15, category: "extras", image: snacksImg },
];
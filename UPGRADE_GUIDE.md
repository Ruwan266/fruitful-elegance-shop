# FruitFlix UAE — Complete System Upgrade Guide

## Overview of Changes

This upgrade introduces **JSON-based local storage** (no database required), an Offers system, configurable delivery options, fixed image uploads, a full message system for the Box Builder, and multiple UI/UX improvements.

---

## 📁 Files to Add / Replace

### NEW FILES (create these)

| File Path | Purpose |
|---|---|
| `src/lib/jsonStore.ts` | Core storage utility — all JSON/localStorage logic lives here |
| `src/admin/Offers.tsx` | Admin panel: create & manage promotional offers |
| `src/admin/Delivery.tsx` | Admin panel: configure delivery options shown at checkout |
| `src/pages/Offers.tsx` | Customer-facing Offers page (`/offers`) |
| `src/components/home/OffersSection.tsx` | Offers section on homepage (auto-shows active offers) |

### REPLACE THESE FILES

| File Path | What Changed |
|---|---|
| `src/lib/jsonStore.ts` | (new) |
| `src/admin/Categories.tsx` | Replaced Supabase calls with JSON storage; images now stored as base64 |
| `src/admin/BoxBuilder.tsx` | Replaced Supabase calls; fixed image upload; added Customer Messages tab |
| `src/pages/Admin.tsx` | Added Offers and Delivery tabs to the admin sidebar |
| `src/pages/Index.tsx` | Added `<OffersSection />` between CategoryGrid and BestSellers |
| `src/pages/BuildYourBox.tsx` | Reads items from JSON store; added message textarea + Send button |
| `src/pages/Checkout.tsx` | Added delivery option selection (reads from JSON store) |
| `src/App.tsx` | Added `/offers` route |
| `src/components/layout/Header.tsx` | Added "Offers" nav link with live pulse dot when offers exist |
| `src/components/home/HeroSection.tsx` | Added offer chips strip and floating offer badge |
| `src/components/home/CategoryGrid.tsx` | Now reads categories from JSON store (with fallback to static images) |
| `index.html` | Proper favicon tags, SEO meta, og:image, theme-color |

---

## 🔧 How JSON Storage Works

All data is stored in the browser's `localStorage` under keys prefixed with `ff_`. Images are stored as base64 data URLs — no external upload service needed.

```
localStorage keys used:
  ff_categories        — category list
  ff_box_items         — build-your-box items
  ff_offers            — promotional offers
  ff_delivery_options  — checkout delivery methods
  ff_box_messages      — customer messages from box builder
```

The `seedDefaults()` function auto-populates sensible default data on first load.

---

## 🖼️ Favicon Setup

Your favicon.ico is already in `/public/`. The updated `index.html` properly references it. To add additional sizes:

1. Go to https://realfavicongenerator.net
2. Upload your FruitFlix logo image
3. Download the package
4. Place all generated files in your `/public/` folder
5. The `index.html` links are already set up to find them

---

## ⭐ Feature Summary

### Admin Panel — Categories
- Upload category image directly → stored as base64 (no Supabase Storage needed)
- Old Supabase upload code is completely replaced
- Images persist in localStorage

### Admin Panel — Box Builder
- **Items tab**: Add/edit/delete items with working image upload (base64)
- **Messages tab**: See all customer messages sent from the Build Your Box page, mark as read, delete
- Unread message count shown in sidebar badge

### Admin Panel — Offers (NEW)
- Create promotional offers with title, subtitle, badge text, discount text
- Pick a background color (presets + custom color picker)
- Upload an optional product image
- Set an expiry date
- Toggle visibility per offer
- Live preview in the modal as you type

### Admin Panel — Delivery (NEW)
- Add delivery options (Same-Day, Next-Day, Scheduled, Express, etc.)
- Set price per option (0 = Free)
- Set estimated delivery time text
- Pick an emoji icon
- Toggle active/inactive per option
- Reorder with ↑ button

### Build Your Box — Message Feature
- Clean textarea input (replaces the contentEditable rich text editor that had issues)
- Attach photo button (stores as base64)
- **Send button** — saves message to `ff_box_messages` store
- Admin can view all messages in BoxBuilder → Messages tab
- Box details (size, color, ribbon, items, total) auto-included with message

### Checkout — Delivery Selection
- Reads active delivery options from `ff_delivery_options`
- Customer selects their preferred method before checkout
- Free vs paid options shown clearly
- "Scheduled" delivery shows a date picker
- Selected option shown in Order Summary

### Offers Page (`/offers`)
- Full page listing all active, non-expired offers
- Beautiful card design with background color, product image, badge
- Animated entrance

### Homepage — Offers Section
- Auto-appears between Categories and BestSellers when active offers exist
- Shows up to 3 offers in a responsive grid

### Homepage — Hero Section
- Offer chips strip below CTA buttons (links to each offer)
- Floating badge in top-right of hero image showing current offer

### Header — Offers Link
- "Offers" added to nav (desktop + mobile)
- Red pulse dot appears on the link when active offers exist

### Category Grid
- Now reads from `ff_categories` (JSON store)
- Falls back to static bundled images if no custom image uploaded
- Fully dynamic — changes in admin reflect immediately on homepage

---

## 🚨 Important Notes

1. **Supabase is still used for Products, Orders, Customers, Analytics, Messages** — those panels are unchanged. Only Categories, BoxBuilder, Offers, and Delivery have been moved to JSON.

2. **Base64 image storage has a size limit** — localStorage has a ~5-10MB limit per domain across all keys. For production with many large images, consider compressing images before upload or switching to Supabase Storage just for images. The current setup is ideal for a small catalog.

3. **The `seedDefaults()` call** — this is called in each component's `useEffect` on mount. It checks if the store is empty and populates default data once. It never overwrites existing data.

4. **Admin password** — still controlled by `VITE_ADMIN_PASSWORD` env variable (default: `FruitFlix2024!`)

5. **Checkout still uses Shopify** — the delivery option selection is a UI enhancement. The actual payment/shipping is still processed by Shopify's hosted checkout.

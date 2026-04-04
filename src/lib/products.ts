import { shopifyFetch } from "./shopify";
import { Product } from "@/data/products";

// ── Price overrides — text part of handle (emoji ignored) ─────────
const PRICE_OVERRIDES: Array<{
  match: string;
  price: number;
  comparePrice: number;
}> = [
  { match: "luxury-fresh-fruit-gift-box-small",   price: 179, comparePrice: 199 },
  { match: "elegant-fresh-fruit-gift-box-medium", price: 249, comparePrice: 299 },
  { match: "premium-fresh-fruit-gift-box-large",  price: 360, comparePrice: 450 },
];

/** Strip emoji & trailing dashes, then check if handle starts with key */
function findOverride(handle: string) {
  // Remove all non-ASCII characters (emoji) and trailing dashes
  const clean = handle.replace(/[^\x00-\x7F]/g, "").replace(/-+$/, "");
  return PRICE_OVERRIDES.find(o => clean.startsWith(o.match));
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id title handle description productType tags availableForSale
          featuredImage { url altText }
          images(first: 6) { edges { node { url } } }
          priceRange {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          compareAtPriceRange {
            maxVariantPrice { amount currencyCode }
          }
          options { name values }
          variants(first: 1) {
            edges { node { id sku availableForSale compareAtPrice { amount } } }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id title handle description productType tags availableForSale
      featuredImage { url altText }
      images(first: 10) { edges { node { url } } }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        maxVariantPrice { amount currencyCode }
      }
      options { name values }
      variants(first: 20) {
        edges { node { id sku availableForSale compareAtPrice { amount } selectedOptions { name value } } }
      }
    }
  }
`;

const BADGE_MAP: Record<string, Product["badge"]> = {
  "best-seller": "best-seller", bestseller: "best-seller",
  premium: "premium", new: "new", limited: "limited", sale: "sale",
};

function adaptProduct(node: any): Product {
  const minPrice = parseFloat(node.priceRange.minVariantPrice.amount);

  // Shopify compareAtPrice
  const compareAtRaw =
    node.compareAtPriceRange?.maxVariantPrice?.amount ??
    node.variants?.edges?.[0]?.node?.compareAtPrice?.amount;
  const compareAtPrice = compareAtRaw ? parseFloat(compareAtRaw) : undefined;
  const shopifyCompare =
    compareAtPrice && compareAtPrice > minPrice
      ? Math.round(compareAtPrice)
      : undefined;

  // Manual override (emoji-safe matching)
  const override = findOverride(node.handle ?? "");
  const finalPrice        = override?.price        ?? Math.round(minPrice);
  const finalComparePrice = override?.comparePrice ?? shopifyCompare;

  // Auto badge "sale" if discount exists
  const badge = finalComparePrice
    ? "sale"
    : node.tags.reduce((found: any, tag: string) => {
        if (found) return found;
        return BADGE_MAP[tag.toLowerCase()] ?? undefined;
      }, undefined);

  const CATEGORY_MAP: Record<string, string> = {
    "fruit gift box": "gift-boxes", "gift box": "gift-boxes", "gift-box": "gift-boxes",
    "fruit gift-box": "gift-boxes", "luxury gift": "gift-boxes",
    "fresh fruit": "fruits", "fruit": "fruits", "fruits": "fruits",
    "nut": "nuts", "nuts": "nuts", "premium nut": "nuts",
    "berr": "berries", "berry": "berries", "berries": "berries",
    "date": "dates", "dates": "dates", "luxury date": "dates",
    "corporate": "corporate", "snack": "snacks", "snacks": "snacks",
  };

  function detectCategory(type: string, tags: string[]): string {
    const allText = [type, ...tags].join(" ").toLowerCase();
    for (const [keyword, slug] of Object.entries(CATEGORY_MAP)) {
      if (allText.includes(keyword)) return slug;
    }
    return type ? type.toLowerCase().replace(/\s+/g, "-") : "gift-boxes";
  }

  const category  = detectCategory(node.productType || "", node.tags);
  const sizeOpt   = node.options.find((o: any) => o.name.toLowerCase() === "size");
  const colorOpt  = node.options.find((o: any) =>
    o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
  );
  const allImages: string[] = node.images.edges.map((e: any) => e.node.url);
  const primaryImage = node.featuredImage?.url ?? allImages[0] ?? "";
  const firstVariant = node.variants.edges[0]?.node;
  const numericId    = node.id.split("/").pop() ?? node.id;

  return {
    id:           numericId,
    shopifyId:    node.id,
    variantId:    firstVariant?.id ?? "",
    handle:       node.handle,
    title:        node.title,
    price:        finalPrice,
    comparePrice: finalComparePrice,
    image:        primaryImage,
    images:       allImages.length ? allImages : [primaryImage],
    category,
    badge,
    rating:       4.8,
    reviewCount:  0,
    description:  node.description,
    sizes:        sizeOpt?.values  ?? ["S", "M", "L"],
    colors:       colorOpt?.values ?? ["Forest Green", "Gold"],
    inStock:      node.availableForSale,
    sku:          firstVariant?.sku ?? "",
    tags:         node.tags,
    whatsInside:  undefined,
  } as Product;
}

export async function fetchShopifyProducts(limit = 48): Promise<Product[]> {
  const data = await shopifyFetch<any>(PRODUCTS_QUERY, { first: limit });
  return data.products.edges.map((e: any) => adaptProduct(e.node));
}

export async function fetchShopifyProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<any>(PRODUCT_BY_HANDLE_QUERY, { handle });
  if (!data.productByHandle) return null;
  return adaptProduct(data.productByHandle);
}
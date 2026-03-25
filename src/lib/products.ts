import { shopifyFetch } from "./shopify";
import { Product } from "@/data/products";

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
          options { name values }
          variants(first: 1) {
            edges { node { id sku availableForSale } }
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
      options { name values }
      variants(first: 20) {
        edges { node { id sku availableForSale selectedOptions { name value } } }
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
  const maxPrice = parseFloat(node.priceRange.maxVariantPrice.amount);
  const badge = node.tags.reduce((found: any, tag: string) => {
    if (found) return found;
    return BADGE_MAP[tag.toLowerCase()] ?? undefined;
  }, undefined);
  // Map Shopify productType / tags → our category slugs
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
    // fallback: slugify productType
    return type ? type.toLowerCase().replace(/\s+/g, "-") : "gift-boxes";
  }

  const category = detectCategory(node.productType || "", node.tags);
  const sizeOpt = node.options.find((o: any) => o.name.toLowerCase() === "size");
  const colorOpt = node.options.find((o: any) =>
    o.name.toLowerCase() === "color" || o.name.toLowerCase() === "colour"
  );
  const allImages: string[] = node.images.edges.map((e: any) => e.node.url);
  const primaryImage = node.featuredImage?.url ?? allImages[0] ?? "";
  const firstVariant = node.variants.edges[0]?.node;
  const numericId = node.id.split("/").pop() ?? node.id;

  return {
    id: numericId,
    shopifyId: node.id,
    variantId: firstVariant?.id ?? "",
    handle: node.handle,
    title: node.title,
    price: Math.round(minPrice),
    comparePrice: maxPrice > minPrice ? Math.round(maxPrice) : undefined,
    image: primaryImage,
    images: allImages.length ? allImages : [primaryImage],
    category,
    badge,
    rating: 4.8,
    reviewCount: 0,
    description: node.description,
    sizes: sizeOpt?.values ?? ["S", "M", "L"],
    colors: colorOpt?.values ?? ["Forest Green", "Gold"],
    inStock: node.availableForSale,
    sku: firstVariant?.sku ?? "",
    tags: node.tags,
    whatsInside: undefined,
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

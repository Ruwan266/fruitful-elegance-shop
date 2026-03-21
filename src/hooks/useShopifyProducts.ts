import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts, fetchShopifyProductByHandle } from "@/lib/products";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/data/products";

const isShopifyConfigured =
  !!import.meta.env.VITE_SHOPIFY_STORE_DOMAIN &&
  !!import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;

export function useShopifyProducts(limit = 48) {
  return useQuery<Product[]>({
    queryKey: ["shopify-products", limit],
    queryFn: () => fetchShopifyProducts(limit),
    enabled: isShopifyConfigured,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    placeholderData: staticProducts,
  });
}

export function useShopifyProduct(handle: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchShopifyProductByHandle(handle!),
    enabled: isShopifyConfigured && !!handle,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    placeholderData: null,
  });
}
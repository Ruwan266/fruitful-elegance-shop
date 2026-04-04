export interface PricingResult {
  currentPrice: number;
  originalPrice: number | undefined;
  hasDiscount: boolean;
  discountPercent: number;
}

export function getPricing(product: {
  price: number;
  comparePrice?: number;
  [key: string]: unknown;
}): PricingResult {
  const currentPrice = Number(product.price) || 0;

  const rawCompare =
    product.comparePrice ??
    (product as Record<string, unknown>)["compare_at_price"] ??
    (product as Record<string, unknown>)["compareAtPrice"];

  const originalPrice =
    rawCompare !== undefined && rawCompare !== null
      ? Number(rawCompare)
      : undefined;

  const hasDiscount =
    originalPrice !== undefined &&
    !isNaN(originalPrice) &&
    originalPrice > currentPrice;

  const discountPercent =
    hasDiscount && originalPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  return {
    currentPrice,
    originalPrice: hasDiscount ? originalPrice : undefined,
    hasDiscount,
    discountPercent,
  };
}

export function formatAED(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}
import { shopifyFetch } from "./shopify";
import { CartItem } from "@/data/products";

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 50) {
          edges { node { id quantity merchandise { ... on ProductVariant { id title } } } }
        }
      }
      userErrors { field message }
    }
  }
`;

export async function createShopifyCheckout(
  items: CartItem[],
  customerAccessToken?: string
): Promise<string> {
  // Map local cart items to Shopify line items using stored variantId
  const lines = items
    .filter((item) => item.product.variantId)
    .map((item) => ({
      merchandiseId: item.product.variantId,
      quantity: item.quantity,
    }));

  if (!lines.length) {
    throw new Error(
      "No Shopify variant IDs found. Make sure products are loaded from Shopify."
    );
  }

  const input: any = { lines };
  if (customerAccessToken) {
    input.buyerIdentity = { customerAccessToken };
  }

  const data = await shopifyFetch<any>(CART_CREATE, { input });
  const errors = data.cartCreate?.userErrors;
  if (errors?.length) throw new Error(errors[0].message);

  const checkoutUrl = data.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) throw new Error("Failed to get checkout URL from Shopify");

  return checkoutUrl;
}
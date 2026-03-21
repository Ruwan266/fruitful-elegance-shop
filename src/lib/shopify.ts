const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || "2024-10";

export async function shopifyFetch<T = any>(
  query: string,
  variables: Record<string, any> = {}
): Promise<T> {
  if (!domain || !token) {
    throw new Error("Shopify env vars not configured. Check your .env file.");
  }
  const res = await fetch(
    `https://${domain}/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Shopify GraphQL: ${json.errors[0]?.message}`);
  return json.data as T;
}

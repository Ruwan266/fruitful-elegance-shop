import { shopifyFetch } from "./shopify";

export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  orders: { edges: { node: { id: string; orderNumber: number; totalPrice: { amount: string }; processedAt: string; fulfillmentStatus: string } }[] };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

const CUSTOMER_CREATE = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email firstName lastName }
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { field message }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_DELETE = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      userErrors { field message }
    }
  }
`;

const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id firstName lastName email phone
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            totalPrice { amount currencyCode }
            processedAt
            fulfillmentStatus
            lineItems(first: 5) {
              edges { node { title quantity } }
            }
          }
        }
      }
    }
  }
`;

// ─── Functions ────────────────────────────────────────────────────────────────

export async function registerCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const data = await shopifyFetch<any>(CUSTOMER_CREATE, { input });
  const errors = data.customerCreate?.customerUserErrors;
  if (errors?.length) throw new Error(errors[0].message);
  return data.customerCreate?.customer;
}

export async function loginCustomer(email: string, password: string) {
  const data = await shopifyFetch<any>(CUSTOMER_ACCESS_TOKEN_CREATE, {
    input: { email, password },
  });
  const errors = data.customerAccessTokenCreate?.customerUserErrors;
  if (errors?.length) throw new Error(errors[0].message);
  return data.customerAccessTokenCreate?.customerAccessToken;
}

export async function logoutCustomer(accessToken: string) {
  await shopifyFetch<any>(CUSTOMER_ACCESS_TOKEN_DELETE, {
    customerAccessToken: accessToken,
  });
}

export async function getCustomer(accessToken: string): Promise<ShopifyCustomer | null> {
  const data = await shopifyFetch<any>(CUSTOMER_QUERY, {
    customerAccessToken: accessToken,
  });
  return data.customer ?? null;
}
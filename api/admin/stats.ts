// @ts-nocheck
// api/admin/stats.ts
// Vercel serverless function — runs server-side, keeps Admin API token secret

export const config = { runtime: "edge" };

const SHOPIFY_DOMAIN = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN;
const API_VERSION = process.env.VITE_SHOPIFY_API_VERSION || "2024-10";

async function shopifyAdmin(endpoint: string) {
  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/${endpoint}`,
    {
      headers: {
        "X-Shopify-Access-Token": ADMIN_TOKEN!,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error(`Shopify Admin API error: ${res.status}`);
  return res.json();
}

export default async function handler(req: Request) {
  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (!ADMIN_TOKEN || !SHOPIFY_DOMAIN) {
    return new Response(
      JSON.stringify({
        error: "SHOPIFY_ADMIN_API_TOKEN not configured",
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        recentOrders: [],
        recentCustomers: [],
      }),
      { status: 200, headers }
    );
  }

  try {
    // Fetch in parallel for speed
    const [ordersData, countData, customersData, pendingData] = await Promise.all([
      shopifyAdmin("orders.json?status=any&limit=50&fields=id,order_number,email,total_price,fulfillment_status,financial_status,processed_at,line_items"),
      shopifyAdmin("orders/count.json?status=any"),
      shopifyAdmin("customers.json?limit=50&fields=id,first_name,last_name,email,orders_count,total_spent,created_at"),
      shopifyAdmin("orders/count.json?fulfillment_status=unfulfilled"),
    ]);

    const orders = ordersData.orders ?? [];
    const customers = customersData.customers ?? [];

    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + parseFloat(o.total_price || "0"),
      0
    );

    const recentOrders = orders.slice(0, 20).map((o: any) => ({
      id: o.id,
      orderNumber: o.order_number,
      email: o.email,
      totalPrice: o.total_price,
      fulfillmentStatus: o.fulfillment_status ?? "unfulfilled",
      financialStatus: o.financial_status,
      processedAt: o.processed_at,
      lineItemsCount: o.line_items?.length ?? 0,
    }));

    const recentCustomers = customers.slice(0, 20).map((c: any) => ({
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      email: c.email,
      ordersCount: c.orders_count,
      totalSpent: c.total_spent,
      createdAt: c.created_at,
    }));

    return new Response(
      JSON.stringify({
        totalOrders: countData.count ?? orders.length,
        totalRevenue: Math.round(totalRevenue),
        totalCustomers: customers.length,
        pendingOrders: pendingData.count ?? 0,
        recentOrders,
        recentCustomers,
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message,
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        pendingOrders: 0,
        recentOrders: [],
        recentCustomers: [],
      }),
      { status: 200, headers }
    );
  }
}
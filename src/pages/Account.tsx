import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Package, LogOut, User, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const Account = () => {
  const { customer, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !customer) navigate("/login");
  }, [customer, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out", description: "See you next time!" });
    navigate("/");
  };

  if (isLoading || !customer) return null;

  const orders = customer.orders?.edges ?? [];

  const statusColor: Record<string, string> = {
    FULFILLED: "bg-primary/10 text-primary",
    UNFULFILLED: "bg-gold/10 text-gold-foreground",
    PARTIALLY_FULFILLED: "bg-blue-50 text-blue-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
  };

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium max-w-4xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold">
                  {customer.firstName} {customer.lastName}
                </h1>
                <p className="font-body text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-destructive transition-colors btn-press">
              <LogOut size={16} /> Sign Out
            </button>
          </motion.div>

          {/* Orders */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag size={18} className="text-primary" />
              <h2 className="font-display text-xl font-semibold">Your Orders</h2>
            </div>

            {orders.length === 0 ? (
              <div className="card-premium p-12 text-center">
                <Package size={40} className="text-muted-foreground/40 mx-auto mb-4" />
                <p className="font-body text-muted-foreground">No orders yet</p>
                <Link to="/shop" className="mt-4 inline-block font-body text-sm text-primary hover:underline">Start shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(({ node: order }: any) => (
                  <div key={order.id} className="card-premium p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-body text-sm font-semibold">Order #{order.orderNumber}</span>
                        <span className={`badge-pill text-xs ${statusColor[order.fulfillmentStatus] ?? "bg-secondary text-secondary-foreground"}`}>
                          {order.fulfillmentStatus?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">
                        {new Date(order.processedAt).toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {order.lineItems?.edges.slice(0, 3).map(({ node: item }: any) => (
                          <span key={item.title} className="font-body text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {item.title} ×{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-body text-base font-semibold">AED {parseFloat(order.totalPrice.amount).toFixed(0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Account;
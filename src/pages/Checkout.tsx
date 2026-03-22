import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createShopifyCheckout } from "@/lib/shopifyCheckout";
import { Link } from "react-router-dom";
import { Shield, Truck, Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const shipping = subtotal >= 200 ? 0 : 25;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!items.length) {
      toast({ title: "Cart is empty", description: "Add some products before checking out.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const checkoutUrl = await createShopifyCheckout(items, accessToken ?? undefined);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      toast({ title: "Checkout error", description: err.message || "Could not start checkout. Please try again.", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium max-w-5xl">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-10">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* Contact */}
              <div className="card-premium p-8 space-y-4">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">1</span>
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Email</label>
                    <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 bg-muted rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Phone</label>
                    <input type="tel" placeholder="+971 50 123 4567" className="w-full px-4 py-3 bg-muted rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="card-premium p-8">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">2</span>
                  Shipping & Payment
                </h2>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-sm font-body text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">🔒 Secure checkout powered by Shopify</p>
                  <p>When you click "Proceed to Checkout" you will be taken to Shopify's secure checkout page where you can enter your shipping address and payment details safely.</p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <div className="card-premium p-8 space-y-6">
                <h2 className="font-display text-xl font-semibold">Order Summary</h2>

                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="font-body text-sm text-muted-foreground">Your cart is empty</p>
                    <Link to="/shop" className="font-body text-sm text-primary hover:underline mt-2 inline-block">Browse products</Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                            <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-medium truncate">{item.product.title}</p>
                            <p className="font-body text-xs text-muted-foreground">{item.size} · {item.color}</p>
                          </div>
                          <span className="font-body text-sm font-medium">AED {item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>AED {subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                          {shipping === 0 ? "Free" : `AED ${shipping}`}
                        </span>
                      </div>
                      {shipping === 0 && (
                        <p className="font-body text-xs text-green-600">🎉 You qualify for free delivery!</p>
                      )}
                      <div className="flex justify-between font-body text-lg font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>AED {total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleCheckout}
                        disabled={loading || !items.length}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                        {loading ? "Processing..." : "Proceed to Checkout"}
                      </button>

                      <div className="flex items-center justify-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1 font-body text-xs"><Shield size={11} /> Secure</div>
                        <div className="flex items-center gap-1 font-body text-xs"><Truck size={11} /> UAE Delivery</div>
                        <div className="flex items-center gap-1 font-body text-xs"><Lock size={11} /> Encrypted</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
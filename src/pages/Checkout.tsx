import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createShopifyCheckout } from "@/lib/shopifyCheckout";
import { Link } from "react-router-dom";
import { Shield, Truck, Lock, Loader2, MessageCircle, Package, Check, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

// ← ඔයාගේ WhatsApp number (country code, + නැතිව)
const WHATSAPP_NUMBER = "971503645103";

interface DeliveryOption {
  id: string; name: string; description: string;
  price: number; estimated_time: string; icon: string;
  is_active: boolean; sort_order: number;
}

const DEFAULT_DELIVERY: DeliveryOption[] = [
  { id: "d1", name: "Standard Delivery", description: "Free delivery on orders above AED 200", price: 0, estimated_time: "2-4 hours", icon: "🚚", is_active: true, sort_order: 1 },
  { id: "d2", name: "Express Delivery",  description: "Priority same-day delivery",            price: 35, estimated_time: "~2 hours", icon: "⚡", is_active: true, sort_order: 2 },
];

const Checkout = () => {
  const { items, subtotal } = useCart();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(DEFAULT_DELIVERY);
  const [selectedDelivery, setSelectedDelivery] = useState("d1");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    supabase.from("app_delivery_options").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDeliveryOptions(data as DeliveryOption[]);
          setSelectedDelivery(data[0].id);
        }
      });
  }, []);

  const shopifyItems = items.filter(i => i.product.variantId);
  const customItems  = items.filter(i => !i.product.variantId);
  const hasShopify   = shopifyItems.length > 0;
  const hasCustom    = customItems.length > 0;

  const selectedOpt  = deliveryOptions.find(o => o.id === selectedDelivery) || deliveryOptions[0];
  const deliveryCost = selectedOpt?.price || 0;
  // Free standard delivery above AED 200, paid options always charged
  const shipping     = deliveryCost > 0 ? deliveryCost : subtotal >= 200 ? 0 : 25;
  const total        = subtotal + shipping;
  const needsDate    = selectedOpt?.name?.toLowerCase().includes("schedul");

  // ── Shopify Checkout ────────────────────────────────────────────────────────
  const handleShopifyCheckout = async () => {
    setLoading(true);
    try {
      const deliveryNote = `Delivery: ${selectedOpt?.name} (${selectedOpt?.estimated_time})${deliveryDate ? ` | Date: ${deliveryDate}` : ""}`;
      const url = await createShopifyCheckout(shopifyItems, accessToken ?? undefined, deliveryNote);
      window.location.href = url;
    } catch (err: any) {
      toast({ title: "Checkout error", description: err.message, variant: "destructive" });
      setLoading(false);
    }
  };

  // ── Custom Box → WhatsApp ───────────────────────────────────────────────────
  const handleWhatsApp = () => {
    const lines = customItems.map(i =>
      `• ${i.product.title} x${i.quantity} — AED ${i.product.price * i.quantity}`
    ).join("\n");
    const msg = encodeURIComponent(
      `🎁 *New Custom Box Order — FruitFlix UAE*\n\n${lines}\n\n` +
      `*Delivery:* ${selectedOpt?.name} (${selectedOpt?.estimated_time})\n` +
      (deliveryDate ? `*Date:* ${deliveryDate}\n` : "") +
      `*Subtotal:* AED ${customItems.reduce((s, i) => s + i.product.price * i.quantity, 0)}\n` +
      `*Shipping:* ${shipping === 0 ? "Free" : `AED ${shipping}`}\n` +
      `*Total:* AED ${total}\n\n` +
      (email ? `*Email:* ${email}\n` : "") +
      (phone ? `*Phone:* ${phone}\n` : "") +
      `\nKindly confirm my order. Thank you! 🙏`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    toast({ title: "Opening WhatsApp ✓" });
  };

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium max-w-5xl">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-10">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Contact */}
              <div className="card-premium p-8 space-y-4">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">1</span>
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-muted rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Phone</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 123 4567"
                      className="w-full px-4 py-3 bg-muted rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery */}
              <div className="card-premium p-8 space-y-5">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">2</span>
                  Delivery Method
                </h2>
                <div className="space-y-3">
                  {deliveryOptions.map(opt => (
                    <motion.button key={opt.id} whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedDelivery(opt.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedDelivery === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedDelivery === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                        {selectedDelivery === opt.id && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                      </div>
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-body text-sm font-semibold">{opt.name}</span>
                          {opt.price === 0
                            ? <span className="bg-green-100 text-green-700 font-body text-[10px] px-2 py-0.5 rounded-full font-medium">Free</span>
                            : <span className="bg-secondary font-body text-[10px] px-2 py-0.5 rounded-full">+AED {opt.price}</span>
                          }
                        </div>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                        <p className="font-body text-xs text-primary mt-0.5 flex items-center gap-1"><Clock size={10} /> {opt.estimated_time}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {needsDate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <label className="font-body text-xs font-medium block mb-2">Preferred Delivery Date</label>
                        <input type="date" value={deliveryDate}
                          min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                          onChange={e => setDeliveryDate(e.target.value)}
                          className="w-full px-4 py-2.5 bg-background rounded-xl border border-border font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delivery note for Shopify */}
                {hasShopify && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 font-body text-xs text-amber-700">
                    <p className="font-semibold mb-0.5">ℹ️ Note about Shopify checkout</p>
                    <p>Your selected delivery method will be added as an order note. Shopify may show its own shipping rates — our team will apply your chosen delivery method and refund any difference.</p>
                  </div>
                )}
              </div>

              {/* Custom Box Notice */}
              {hasCustom && (
                <div className="card-premium p-6 border-2 border-green-200 bg-green-50/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-body text-sm font-semibold mb-1">🎁 Custom Box — Order via WhatsApp</h3>
                      <p className="font-body text-xs text-muted-foreground">Your custom box will be confirmed by our team via WhatsApp personally.</p>
                      <div className="mt-2 space-y-1">
                        {customItems.map(item => (
                          <div key={item.product.id} className="flex justify-between font-body text-xs">
                            <span className="text-muted-foreground">{item.product.title} ×{item.quantity}</span>
                            <span className="font-medium">AED {item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shopify Payment */}
              {hasShopify && (
                <div className="card-premium p-8">
                  <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">3</span>
                    Secure Payment
                  </h2>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 font-body text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">🔒 Checkout powered by Shopify</p>
                    <p>You'll be taken to Shopify's secure checkout. Your delivery preference will be included as an order note and our team will arrange accordingly.</p>
                  </div>
                </div>
              )}
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
                    <div className="space-y-3 max-h-56 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative bg-muted">
                            {item.product.image
                              ? <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-muted-foreground/40" /></div>
                            }
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-medium truncate">{item.product.title}</p>
                            <p className="font-body text-xs text-muted-foreground">
                              {[item.size, item.color].filter(Boolean).join(" · ")}
                              {!item.product.variantId && <span className="ml-1 text-green-600 font-medium">Custom</span>}
                            </p>
                          </div>
                          <span className="font-body text-sm font-medium">AED {item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Selected delivery */}
                    {selectedOpt && (
                      <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                        <span className="text-base">{selectedOpt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs font-semibold truncate">{selectedOpt.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{selectedOpt.estimated_time}</p>
                        </div>
                        {selectedOpt.price === 0
                          ? <span className="font-body text-xs text-green-600 font-medium">{subtotal >= 200 ? "Free" : "AED 25"}</span>
                          : <span className="font-body text-xs font-medium">AED {selectedOpt.price}</span>
                        }
                      </div>
                    )}

                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>AED {subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                          {shipping === 0 ? "Free 🎉" : `AED ${shipping}`}
                        </span>
                      </div>
                      {subtotal < 200 && shipping > 0 && deliveryCost === 0 && (
                        <p className="font-body text-xs text-muted-foreground">
                          Add AED {(200 - subtotal).toFixed(0)} more for free delivery
                        </p>
                      )}
                      <div className="flex justify-between font-body text-lg font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>AED {total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {!hasShopify && hasCustom && (
                        <button onClick={handleWhatsApp} disabled={loading}
                          className="w-full py-4 bg-green-600 text-white rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                          <MessageCircle size={18} /> Order via WhatsApp 📲
                        </button>
                      )}
                      {hasShopify && !hasCustom && (
                        <button onClick={handleShopifyCheckout} disabled={loading}
                          className="w-full py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
                          {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                          {loading ? "Processing..." : "Proceed to Checkout"}
                        </button>
                      )}
                      {hasShopify && hasCustom && (
                        <div className="space-y-2">
                          <button onClick={handleShopifyCheckout} disabled={loading}
                            className="w-full py-3.5 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                            Checkout via Shopify
                          </button>
                          <button onClick={handleWhatsApp}
                            className="w-full py-3.5 bg-green-600 text-white rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press flex items-center justify-center gap-2">
                            <MessageCircle size={16} /> Custom Box via WhatsApp
                          </button>
                        </div>
                      )}
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

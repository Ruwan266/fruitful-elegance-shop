import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createShopifyCheckout } from "@/lib/shopifyCheckout";
import { Link } from "react-router-dom";
import { Shield, Truck, Lock, Loader2, Check, MapPin, Clock, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getStore, seedDefaults, KEYS, type DeliveryOption } from "@/lib/jsonStore";
import { motion, AnimatePresence } from "framer-motion";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Delivery
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState("");

  useEffect(() => {
    seedDefaults();
    const opts = getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, [])
      .filter(o => o.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
    setDeliveryOptions(opts);
    if (opts.length > 0) setSelectedDelivery(opts[0].id);
  }, []);

  const selectedOption = deliveryOptions.find(o => o.id === selectedDelivery);
  const deliveryCost = selectedOption?.price || 0;
  const baseShipping = subtotal >= 200 ? 0 : 25;
  const totalShipping = selectedOption ? deliveryCost : baseShipping;
  const total = subtotal + totalShipping;

  const needsDate = selectedOption?.name.toLowerCase().includes("scheduled");

  const handleCheckout = async () => {
    if (!items.length) {
      toast({ title: "Cart is empty", description: "Add some products before checking out.", variant: "destructive" });
      return;
    }
    if (!selectedDelivery) {
      toast({ title: "Select a delivery option", variant: "destructive" });
      return;
    }
    if (needsDate && !deliveryDate) {
      toast({ title: "Please select a delivery date", variant: "destructive" });
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

              {/* Delivery Options */}
              {deliveryOptions.length > 0 && (
                <div className="card-premium p-8 space-y-5">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">2</span>
                    Delivery Method
                  </h2>

                  <div className="space-y-3">
                    {deliveryOptions.map(opt => (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedDelivery(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${selectedDelivery === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-background"}`}
                      >
                        {/* Check indicator */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedDelivery === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                          {selectedDelivery === opt.id && <Check size={11} className="text-primary-foreground" strokeWidth={3} />}
                        </div>

                        <span className="text-xl flex-shrink-0">{opt.icon}</span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-body text-sm font-semibold">{opt.name}</span>
                            {opt.price === 0 ? (
                              <span className="bg-green-100 text-green-700 font-body text-[10px] px-2 py-0.5 rounded-full font-medium">Free</span>
                            ) : (
                              <span className="bg-secondary text-secondary-foreground font-body text-[10px] px-2 py-0.5 rounded-full">+AED {opt.price}</span>
                            )}
                          </div>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                          <p className="font-body text-xs text-primary mt-0.5 flex items-center gap-1">
                            <Clock size={10} /> {opt.estimated_time}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Date picker for scheduled delivery */}
                  <AnimatePresence>
                    {needsDate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2">
                          <label className="font-body text-xs font-medium text-foreground block mb-2 flex items-center gap-1.5">
                            <MapPin size={12} className="text-primary" /> Preferred Delivery Date
                          </label>
                          <input
                            type="date"
                            value={deliveryDate}
                            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                            onChange={e => setDeliveryDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-background rounded-xl border border-border font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Payment */}
              <div className="card-premium p-8">
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-body text-xs font-bold">{deliveryOptions.length > 0 ? "3" : "2"}</span>
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

                    {/* Selected delivery summary */}
                    {selectedOption && (
                      <div className="bg-muted rounded-xl p-3 flex items-center gap-3">
                        <span className="text-base">{selectedOption.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs font-semibold truncate">{selectedOption.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{selectedOption.estimated_time}</p>
                        </div>
                        <button onClick={() => {}} className="font-body text-[10px] text-primary hover:underline flex items-center gap-0.5">
                          Change <ChevronRight size={10} />
                        </button>
                      </div>
                    )}

                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>AED {subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">
                          {selectedOption ? `${selectedOption.name}` : "Shipping"}
                        </span>
                        <span className={totalShipping === 0 ? "text-green-600 font-medium" : ""}>
                          {totalShipping === 0 ? "Free" : `AED ${totalShipping}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-body text-lg font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>AED {total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button onClick={handleCheckout} disabled={loading || !items.length}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
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

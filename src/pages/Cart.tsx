import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, Truck, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const [coupon, setCoupon] = useState("");
  const shipping = subtotal >= 200 ? 0 : 25;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <section className="section-spacing bg-background">
          <div className="container-premium text-center py-20">
            <p className="font-display text-5xl mb-4">🛒</p>
            <h1 className="font-display text-3xl font-semibold">Your Cart is Empty</h1>
            <p className="font-body text-muted-foreground mt-2">Discover our premium gift collections</p>
            <Link to="/shop" className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press">
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-10">Your Gift Box</h1>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 font-body text-xs text-muted-foreground uppercase tracking-wider pb-4 border-b border-border">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  layout
                  className="card-premium p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center"
                >
                  {/* Product */}
                  <div className="md:col-span-6 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/product/${item.product.id}`} className="font-body text-sm font-medium hover:text-primary transition-colors line-clamp-2">
                        {item.product.title}
                      </Link>
                      <p className="font-body text-xs text-muted-foreground mt-1">{item.size} · {item.color}</p>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-2 flex items-center justify-center mt-3 md:mt-0">
                    <div className="flex items-center bg-secondary rounded-full">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 btn-press"><Minus size={14} /></button>
                      <span className="w-8 text-center font-body text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 btn-press"><Plus size={14} /></button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="md:col-span-2 text-center hidden md:block">
                    <span className="font-body text-sm">AED {item.product.price}</span>
                  </div>

                  {/* Total + Remove */}
                  <div className="md:col-span-2 flex items-center justify-end gap-3 mt-3 md:mt-0">
                    <span className="font-body text-sm font-semibold">AED {item.product.price * item.quantity}</span>
                    <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-muted-foreground hover:text-berry transition-colors btn-press">
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}

              <Link to="/shop" className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline mt-4">
                ← Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <div className="card-premium p-8 space-y-6">
                <h2 className="font-display text-xl font-semibold">Order Summary</h2>

                {/* Delivery Progress */}
                {subtotal < 200 && (
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={16} className="text-primary" />
                      <span className="font-body text-xs">Add AED {(200 - subtotal).toFixed(0)} for free delivery</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all" style={{ width: `${Math.min((subtotal / 200) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-4 py-3 bg-muted rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button className="px-5 py-3 bg-secondary text-secondary-foreground rounded-xl font-body text-sm font-medium hover:bg-primary/10 transition-colors btn-press">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>AED {subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-primary font-medium" : ""}>
                      {shipping === 0 ? "Free" : `AED ${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-body text-lg font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>AED {total.toFixed(0)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold text-center hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20"
                >
                  Proceed to Checkout
                </Link>

                {/* Trust */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {["🔒 Secure", "🚚 Free Delivery", "✨ Fresh"].map((t, i) => (
                    <span key={i} className="font-body text-[10px] text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;

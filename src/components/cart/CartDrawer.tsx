import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalItems, subtotal } = useCart();

  const freeDeliveryThreshold = 200;
  const deliveryProgress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl">Your Gift Box</h2>
                <p className="font-body text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors btn-press">
                <X size={20} />
              </button>
            </div>

            {/* Delivery Progress */}
            {subtotal < freeDeliveryThreshold && (
              <div className="px-6 py-4 bg-secondary/50">
                <p className="font-body text-xs text-muted-foreground mb-2">
                  Add AED {(freeDeliveryThreshold - subtotal).toFixed(0)} more for complimentary delivery
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
                    style={{ width: `${deliveryProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="font-display text-lg text-muted-foreground">Your box is empty</p>
                  <p className="font-body text-sm text-muted-foreground/60 mt-1">Discover our premium collections</p>
                  <Link
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full font-body text-sm font-medium hover:brightness-110 transition-all btn-press"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4 p-3 rounded-2xl bg-secondary/30"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body text-sm font-medium truncate">{item.product.title}</h4>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{item.size} · {item.color}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-muted rounded-full">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 hover:text-primary transition-colors btn-press">
                            <Minus size={14} />
                          </button>
                          <span className="font-body text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 hover:text-primary transition-colors btn-press">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-body text-sm font-semibold">AED {(item.product.price * item.quantity).toFixed(0)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="self-start p-1 text-muted-foreground hover:text-berry transition-colors">
                      <X size={16} />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between font-body">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-lg font-semibold">AED {subtotal.toFixed(0)}</span>
                </div>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold text-center hover:brightness-110 transition-all btn-press"
                >
                  View Cart & Checkout
                </Link>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 text-center font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

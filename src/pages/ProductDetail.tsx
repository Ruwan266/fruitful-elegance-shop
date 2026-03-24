import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { useShopifyProducts, useShopifyProduct } from "@/hooks/useShopifyProducts";
import { products as staticProducts } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Minus, Plus, Heart, Share2, Truck, Shield, Package, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: shopifyProduct, isLoading } = useShopifyProduct(handle);
  const { data: allProducts } = useShopifyProducts(48);

  // Fall back to static product by id if Shopify not connected
  const staticFallback = staticProducts.find(p => p.id === handle || p.handle === handle);
  const product = shopifyProduct ?? staticFallback;

  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How long does delivery take?", a: "Same-day delivery available across Dubai. Abu Dhabi and Sharjah within 24 hours." },
    { q: "Can I add a gift note?", a: "Yes! Add a personalized handwritten note at checkout. It's complimentary with every order." },
    { q: "What if items are damaged?", a: "We guarantee freshness. If anything arrives damaged, we'll replace it immediately at no extra cost." },
    { q: "Do you offer corporate discounts?", a: "Yes, we offer special pricing for bulk and corporate orders. Contact us for a custom quote." },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container-premium section-spacing flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-premium section-spacing text-center">
          <h1 className="font-display text-2xl">Product not found</h1>
          <Link to="/shop" className="font-body text-sm text-primary mt-4 inline-block">Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  const relatedProducts = (allProducts ?? staticProducts)
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          <nav className="flex items-center gap-2 font-body text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <div className="lg:sticky lg:top-32 lg:self-start space-y-4">
              <motion.div key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square rounded-3xl overflow-hidden bg-muted">
                <img src={product.images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
              </motion.div>
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all btn-press ${selectedImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category.replace("-", " ")}</p>
                <h1 className="font-display text-3xl md:text-4xl font-semibold">{product.title}</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.round(product.rating) ? "fill-gold text-gold" : "text-muted"} />)}
                </div>
                <span className="font-body text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold">AED {product.price}</span>
                {product.comparePrice && (
                  <>
                    <span className="font-body text-lg text-muted-foreground line-through">AED {product.comparePrice}</span>
                    <span className="badge-pill bg-berry/10 text-berry text-xs">Save {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%</span>
                  </>
                )}
              </div>

              <p className="font-body text-muted-foreground leading-relaxed">{product.description}</p>

              {product.whatsInside && (
                <div className="p-5 rounded-2xl bg-secondary/50 space-y-3">
                  <h3 className="font-display text-sm font-semibold flex items-center gap-2"><Package size={16} className="text-primary" /> What's Inside</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.whatsInside.map((item, i) => <span key={i} className="badge-pill bg-background text-foreground text-xs">{item}</span>)}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-body text-sm font-semibold mb-3">Box Color</h3>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button key={color} onClick={() => setSelectedColor(color)} className={`px-5 py-3 rounded-full font-body text-xs font-medium transition-all btn-press ${selectedColor === color ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{color}</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-secondary rounded-full">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:text-primary transition-colors btn-press"><Minus size={18} /></button>
                  <span className="w-12 text-center font-body font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:text-primary transition-colors btn-press"><Plus size={18} /></button>
                </div>
                <button onClick={() => addToCart(product, quantity, "", selectedColor || product.colors[0] || "")} className="flex-1 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20">
                  Add to Cart — AED {product.price * quantity}
                </button>
                <button className="p-4 rounded-full border border-border hover:border-berry hover:text-berry transition-all btn-press"><Heart size={20} /></button>
              </div>

              <Link to="/checkout" className="block w-full py-4 border-2 border-primary text-primary rounded-full font-body text-sm font-semibold text-center hover:bg-primary hover:text-primary-foreground transition-all btn-press">Buy Now</Link>

              <div className="grid grid-cols-3 gap-3">
                {[{ icon: Truck, text: "Free UAE Delivery" }, { icon: Shield, text: "Freshness Guarantee" }, { icon: Package, text: "Gift-Ready" }].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 text-center">
                    <Icon size={18} className="text-primary" />
                    <span className="font-body text-[11px] text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Share2 size={16} className="text-muted-foreground" />
                <span className="font-body text-xs text-muted-foreground">Share:</span>
                {["WhatsApp", "Instagram", "Copy Link"].map(s => <button key={s} className="font-body text-xs text-primary hover:underline">{s}</button>)}
              </div>

              <div className="space-y-2 pt-6">
                <h3 className="font-display text-lg font-semibold mb-4">Frequently Asked</h3>
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-border rounded-2xl overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 font-body text-sm font-medium text-left hover:bg-secondary/50 transition-colors">
                      {faq.q}
                      {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <p className="px-4 pb-4 font-body text-sm text-muted-foreground">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="font-display text-2xl font-semibold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;

import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { useState } from "react";
import { getPricing, formatAED } from "@/lib/pricing";

const badgeStyles: Record<string, string> = {
  "best-seller": "bg-primary/90 text-primary-foreground",
  premium: "bg-gold/90 text-foreground",
  new: "bg-berry/90 text-berry-foreground",
  limited: "bg-foreground/80 text-background",
  sale: "bg-berry/90 text-berry-foreground",
};

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const productLink = `/product/${product.handle || product.id}`;
  const { currentPrice, originalPrice, hasDiscount, discountPercent } = getPricing(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      viewport={{ once: true }}
      className="card-premium group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-1.5 sm:p-2">
        {/* Image */}
        <Link to={productLink}>
          <div className="aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
              loading="lazy"
            />
          </div>
        </Link>

        {product.badge && (
          <span className={`badge-pill absolute top-3 left-3 text-[10px] sm:text-xs ${badgeStyles[product.badge]}`}>
            {product.badge.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        )}

        {/* Desktop hover buttons */}
        <div className={`hidden sm:flex absolute top-4 right-4 flex-col gap-2 transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}`}>
          <button className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-berry hover:text-berry-foreground transition-all btn-press shadow-sm">
            <Heart size={16} />
          </button>
          <Link to={productLink} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all btn-press shadow-sm">
            <Eye size={16} />
          </Link>
        </div>

        {/* Desktop Quick Add */}
        <div className={`hidden sm:block absolute bottom-4 left-4 right-4 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <button
            onClick={() => addToCart(product, 1, product.sizes[0], product.colors[0])}
            className="w-full py-3 glass-dark text-primary-foreground rounded-full font-body text-sm font-medium flex items-center justify-center gap-2 hover:brightness-110 transition-all btn-press"
          >
            <ShoppingBag size={16} />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-2.5 pb-3 pt-1.5 sm:px-4 sm:pb-4 sm:pt-2">
        <Link to={productLink} className="block">
          <p className="font-body text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
            {product.category.replace("-", " ")}
          </p>
          <h3 className="font-display text-sm sm:text-base font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className={i < Math.round(product.rating) ? "fill-gold text-gold" : "text-muted"} />
            ))}
          </div>
          <span className="font-body text-[10px] sm:text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* ── UPDATED PRICE SECTION ─────────────────────────────── */}
        <div className="mt-2 sm:mt-2.5">
          {hasDiscount && originalPrice ? (
            <>
              {/* Discount badge + original price row */}
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="font-body text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: "linear-gradient(135deg, #c6a74d22, #e8c96a33)",
                    color: "#b8952a",
                    border: "1px solid #c6a74d44",
                  }}
                >
                  {discountPercent}% OFF
                </span>
                <span
                  className="font-body text-[11px] sm:text-xs text-muted-foreground"
                  style={{ textDecoration: "line-through", textDecorationColor: "#c6a74d", textDecorationThickness: "1.5px" }}
                >
                  {formatAED(originalPrice)}
                </span>
              </div>

              {/* Sale price — dominant */}
              <span
                className="font-body text-base sm:text-lg font-bold"
                style={{ color: "hsl(var(--primary))", letterSpacing: "-0.02em" }}
              >
                {formatAED(currentPrice)}
              </span>
            </>
          ) : (
            /* Normal price — no discount */
            <span className="font-body text-sm sm:text-base font-semibold text-foreground">
              {formatAED(currentPrice)}
            </span>
          )}
        </div>
        {/* ── END PRICE SECTION ────────────────────────────────── */}

        {/* Mobile Add to Cart button — always visible */}
        <button
          onClick={() => addToCart(product, 1, product.sizes[0], product.colors[0])}
          className="sm:hidden mt-2.5 w-full py-2.5 bg-primary text-primary-foreground rounded-full font-body text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <ShoppingBag size={13} />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
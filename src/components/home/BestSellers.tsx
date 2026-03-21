import ProductCard from "@/components/product/ProductCard";
import { products as staticProducts } from "@/data/products";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BestSellers = () => {
  const { data: shopifyProducts } = useShopifyProducts(24);
  const allProducts = shopifyProducts?.length ? shopifyProducts : staticProducts;
  const bestSellers = allProducts.filter(p => p.badge === "best-seller" || p.rating >= 4.8).slice(0, 4);

  return (
    <section className="section-spacing bg-secondary/30">
      <div className="container-premium">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Customer Favourites</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Best Sellers</h2>
          </div>
          <Link to="/shop" className="font-body text-sm text-primary font-medium flex items-center gap-1 mt-4 md:mt-0 hover:gap-2 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
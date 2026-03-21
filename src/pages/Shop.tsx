import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/product/ProductCard";
import { products as staticProducts, categories } from "@/data/products";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Selling" },
];

const priceRanges = [
  { label: "Under AED 100", min: 0, max: 100 },
  { label: "AED 100 - 200", min: 100, max: 200 },
  { label: "AED 200 - 350", min: 200, max: 350 },
  { label: "AED 350+", min: 350, max: Infinity },
];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState("featured");
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: shopifyProducts, isLoading, isError } = useShopifyProducts(48);
  const products = shopifyProducts?.length ? shopifyProducts : staticProducts;

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    if (selectedPrice !== null) {
      const range = priceRanges[selectedPrice];
      result = result.filter(p => p.price >= range.min && p.price < range.max);
    }
    switch (selectedSort) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [products, selectedCategory, selectedSort, selectedPrice]);

  const clearFilters = () => { setSelectedCategory(""); setSelectedPrice(null); setSelectedSort("featured"); };
  const hasFilters = selectedCategory || selectedPrice !== null;

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-5xl font-semibold">Our Collection</h1>
            <p className="font-body text-muted-foreground mt-2">Premium fruits, nuts, dates & luxury gift boxes</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-8 justify-center">
            <button onClick={() => setSelectedCategory("")} className={`badge-pill transition-all btn-press ${!selectedCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>All</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategory ? "" : cat.id)} className={`badge-pill transition-all btn-press ${selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>{cat.name}</button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Loading…</span>
              ) : (
                <>
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                  {isError && <span className="text-xs text-muted-foreground ml-1">(showing catalogue)</span>}
                  {hasFilters && <button onClick={clearFilters} className="ml-2 text-berry hover:underline inline-flex items-center gap-1"><X size={14} /> Clear</button>}
                </>
              )}
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 font-body text-sm btn-press"><SlidersHorizontal size={16} /> Filters</button>
              <select value={selectedSort} onChange={e => setSelectedSort(e.target.value)} className="font-body text-sm bg-transparent border-none focus:outline-none cursor-pointer text-muted-foreground">
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-56 flex-shrink-0 space-y-6`}>
              <div>
                <h3 className="font-body text-sm font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, i) => (
                    <button key={i} onClick={() => setSelectedPrice(selectedPrice === i ? null : i)} className={`block w-full text-left px-3 py-2 rounded-xl font-body text-sm transition-colors btn-press ${selectedPrice === i ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>{range.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-body text-sm font-semibold mb-3">Availability</h3>
                <label className="flex items-center gap-2 font-body text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-border" /> In Stock Only
                </label>
              </div>
            </aside>

            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="card-premium animate-pulse">
                      <div className="p-2"><div className="aspect-square rounded-2xl bg-muted" /></div>
                      <div className="px-4 pb-4 pt-2 space-y-2">
                        <div className="h-3 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                        <div className="h-4 bg-muted rounded w-1/4 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-display text-xl text-muted-foreground">No products found</p>
                  <button onClick={clearFilters} className="mt-4 font-body text-sm text-primary hover:underline">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
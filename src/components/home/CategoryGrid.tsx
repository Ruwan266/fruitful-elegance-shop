import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getCategories, type Category } from "@/lib/sharedStore";
import fruitsImg    from "@/assets/fruits-collection.jpg";
import nutsImg      from "@/assets/nuts-collection.jpg";
import datesImg     from "@/assets/dates-collection.jpg";
import berriesImg   from "@/assets/berries-collection.jpg";
import giftboxImg   from "@/assets/giftbox-collection.jpg";
import corporateImg from "@/assets/corporate-gifting.jpg";
import snacksImg    from "@/assets/snacks-collection.jpg";

const FALLBACK: Record<string, string> = {
  fruits: fruitsImg, nuts: nutsImg, dates: datesImg, berries: berriesImg,
  "gift-boxes": giftboxImg, corporate: corporateImg, snacks: snacksImg,
};

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories(true).then(data =>
      setCategories(data.sort((a, b) => a.sort_order - b.sort_order))
    );
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="section-spacing bg-background">
      <div className="container-premium">
        <div className="text-center mb-12">
          <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Collections</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => {
            const imageSrc = cat.image || FALLBACK[cat.slug] || fruitsImg;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }} viewport={{ once: true }}>
                <Link to={`/shop?category=${cat.slug}`} className="group block">
                  <div className="relative aspect-square rounded-3xl overflow-hidden mb-3">
                    <img src={imageSrc} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-display text-lg text-background font-medium">{cat.name}</h3>
                      {cat.description && <p className="font-body text-xs text-background/70 mt-0.5 line-clamp-1">{cat.description}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

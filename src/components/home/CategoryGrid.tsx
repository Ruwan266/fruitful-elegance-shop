import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "@/data/products";
import { ArrowRight } from "lucide-react";

const CategoryGrid = () => {
  return (
    <section className="section-spacing bg-background">
      <div className="container-premium">
        <div className="text-center mb-12">
          <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Collections</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/shop?category=${cat.id}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-3xl overflow-hidden mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-lg text-background font-medium">{cat.name}</h3>
                    <p className="font-body text-xs text-background/70">{cat.count} products</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;

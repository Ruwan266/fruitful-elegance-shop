import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { getStore, seedDefaults, KEYS, type Offer } from "@/lib/jsonStore";
import { ArrowRight, Tag } from "lucide-react";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    seedDefaults();
    const all = getStore<Offer[]>(KEYS.OFFERS, []);
    // Filter active and non-expired
    const now = new Date();
    const active = all
      .filter(o => o.is_active && (!o.expires_at || new Date(o.expires_at) > now))
      .sort((a, b) => a.sort_order - b.sort_order);
    setOffers(active);
  }, []);

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4">
              <Tag size={12} /> Special Offers
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">
              Exclusive Deals &{" "}
              <span className="text-gradient-gold">Promotions</span>
            </h1>
            <p className="font-body text-base text-muted-foreground mt-4 max-w-lg mx-auto">
              Discover our latest offers on premium fruits, gift boxes, and more. Limited-time deals crafted for you.
            </p>
          </motion.div>

          {/* Offers Grid */}
          {offers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-card rounded-3xl border border-border"
            >
              <Tag size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No Active Offers Right Now</h3>
              <p className="font-body text-sm text-muted-foreground mb-6">Check back soon for exciting promotions and deals.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all">
                Browse Shop <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link to={offer.link || "/shop"} className="group block relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div
                      className="relative h-64 md:h-72 flex items-center px-10"
                      style={{ backgroundColor: offer.bg_color }}
                    >
                      {/* Decorative circles */}
                      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full opacity-10 bg-white" />
                      <div className="absolute -right-4 top-4 w-24 h-24 rounded-full opacity-10 bg-white" />

                      {/* Product image */}
                      {offer.image && (
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="absolute right-8 bottom-0 h-56 object-contain opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2"
                        />
                      )}

                      {/* Content */}
                      <div className="relative z-10 max-w-xs space-y-3">
                        {offer.badge && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                            className="inline-block bg-white/20 backdrop-blur-sm text-white font-body text-xs px-3 py-1 rounded-full border border-white/20"
                          >
                            {offer.badge}
                          </motion.span>
                        )}
                        <h2 className="font-display text-2xl md:text-3xl text-white font-semibold leading-tight">
                          {offer.title}
                        </h2>
                        {offer.subtitle && (
                          <p className="font-body text-white/75 text-sm">{offer.subtitle}</p>
                        )}
                        {offer.discount_text && (
                          <div
                            className="inline-flex items-center gap-2 bg-white font-body font-bold text-sm px-4 py-2 rounded-full shadow-lg"
                            style={{ color: offer.bg_color }}
                          >
                            {offer.discount_text}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white/80 font-body text-sm group-hover:text-white transition-colors pt-1">
                          Shop Now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center bg-card rounded-3xl border border-border p-12"
          >
            <h3 className="font-display text-2xl font-semibold mb-3">Want a Custom Corporate Deal?</h3>
            <p className="font-body text-muted-foreground mb-6">We offer special pricing for bulk orders and corporate gifting programs.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Contact Us <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { getOffers, type Offer } from "@/lib/sharedStore";
import { ArrowRight, Tag } from "lucide-react";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers(true).then(data => {
      const now = new Date();
      setOffers(data.filter(o => !o.expires_at || new Date(o.expires_at) > now));
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
            <span className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4"><Tag size={12} /> Special Offers</span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold">Exclusive Deals & <span className="text-gradient-gold">Promotions</span></h1>
            <p className="font-body text-base text-muted-foreground mt-4 max-w-lg mx-auto">Discover our latest offers on premium fruits, gift boxes, and more.</p>
          </motion.div>
          {loading ? (
            <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : offers.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-card rounded-3xl border border-border">
              <Tag size={48} className="text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Active Offers Right Now</h3>
              <p className="font-body text-sm text-muted-foreground mb-6">Check back soon for exciting promotions.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all">Browse Shop <ArrowRight size={16} /></Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer, i) => (
                <motion.div key={offer.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Link to={offer.link || "/shop"} className="group block relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div className="relative h-64 md:h-72 flex items-center px-10" style={{ backgroundColor: offer.bg_color }}>
                      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full opacity-10 bg-white" />
                      {offer.image && <img src={offer.image} alt={offer.title} className="absolute right-8 bottom-0 h-56 object-contain opacity-90 transition-transform duration-500 group-hover:scale-105" />}
                      <div className="relative z-10 max-w-xs space-y-3">
                        {offer.badge && <span className="inline-block bg-white/20 text-white font-body text-xs px-3 py-1 rounded-full">{offer.badge}</span>}
                        <h2 className="font-display text-2xl md:text-3xl text-white font-semibold leading-tight">{offer.title}</h2>
                        {offer.subtitle && <p className="font-body text-white/75 text-sm">{offer.subtitle}</p>}
                        {offer.discount_text && <div className="inline-flex bg-white font-body font-bold text-sm px-4 py-2 rounded-full shadow-lg" style={{ color: offer.bg_color }}>{offer.discount_text}</div>}
                        <div className="flex items-center gap-2 text-white/80 group-hover:text-white font-body text-sm pt-1">Shop Now <ArrowRight size={14} /></div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center bg-card rounded-3xl border border-border p-12">
            <h3 className="font-display text-2xl font-semibold mb-3">Want a Custom Corporate Deal?</h3>
            <p className="font-body text-muted-foreground mb-6">Special pricing for bulk orders and corporate gifting programs.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20">Contact Us <ArrowRight size={16} /></Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import { getOffers, type Offer } from "@/lib/sharedStore";

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    getOffers(true).then(data => {
      const now = new Date();
      setOffers(data.filter(o => !o.expires_at || new Date(o.expires_at) > now).slice(0, 3));
    });
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="section-spacing bg-muted/30">
      <div className="container-premium">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Promotions</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-1">Current Offers</h2>
          </div>
          <Link to="/offers" className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className={`grid gap-5 ${offers.length === 1 ? "grid-cols-1 max-w-2xl" : offers.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
          {offers.map((offer, i) => (
            <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Link to={offer.link || "/shop"} className="group block relative rounded-3xl overflow-hidden h-52 shadow-md hover:shadow-xl transition-all duration-500">
                <div className="absolute inset-0 flex items-center px-8" style={{ backgroundColor: offer.bg_color }}>
                  <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full opacity-10 bg-white" />
                  {offer.image && <img src={offer.image} alt={offer.title} className="absolute right-6 bottom-0 h-44 object-contain opacity-90 transition-transform duration-500 group-hover:scale-105" />}
                  <div className="relative z-10 space-y-2 max-w-[180px]">
                    {offer.badge && <span className="inline-flex items-center gap-1 bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full"><Tag size={8} /> {offer.badge}</span>}
                    <h3 className="font-display text-xl text-white font-semibold leading-tight">{offer.title}</h3>
                    {offer.subtitle && <p className="font-body text-white/70 text-xs line-clamp-2">{offer.subtitle}</p>}
                    {offer.discount_text && <div className="inline-block bg-white font-body font-bold text-xs px-3 py-1.5 rounded-full shadow" style={{ color: offer.bg_color }}>{offer.discount_text}</div>}
                    <div className="flex items-center gap-1 text-white/80 group-hover:text-white font-body text-xs pt-0.5">Shop Now <ArrowRight size={11} /></div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

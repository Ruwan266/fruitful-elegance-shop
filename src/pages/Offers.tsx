import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { getOffers, type Offer } from "@/lib/sharedStore";
import { ArrowRight, Tag } from "lucide-react";

type OfferExt = Offer & {
  img_position?: string;
  img_size?: string;
  img_layout?: string;
  overlay_opacity?: number;
  show_gradient?: boolean;
};

function OfferBanner({ offer }: { offer: OfferExt }) {
  const layout   = offer.img_layout ?? "full-bg";
  const opacity  = offer.overlay_opacity ?? 0.55;
  const gradient = offer.show_gradient ?? true;
  const position = offer.img_position ?? "center";
  const size     = offer.img_size ?? "cover";

  const overlayBg = gradient
    ? `linear-gradient(160deg, rgba(0,0,0,${opacity * 0.7}) 0%, rgba(0,0,0,${opacity * 0.2}) 45%, rgba(0,0,0,${opacity}) 100%)`
    : `rgba(0,0,0,${opacity})`;

  if (layout === "side-image") {
    return (
      <div className="relative h-64 md:h-72 flex items-center px-10 overflow-hidden" style={{ backgroundColor: offer.bg_color }}>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full opacity-10 bg-white" />
        {offer.image && <img src={offer.image} alt={offer.title} className="absolute right-8 bottom-0 h-56 object-contain opacity-90 transition-transform duration-500 group-hover:scale-105" />}
        <div className="relative z-10 max-w-xs space-y-3">
          {offer.badge && <span className="inline-block bg-white/20 text-white font-body text-xs px-3 py-1 rounded-full">{offer.badge}</span>}
          <h2 className="font-display text-2xl md:text-3xl text-white font-semibold leading-tight">{offer.title}</h2>
          {offer.subtitle && <p className="font-body text-white/75 text-sm">{offer.subtitle}</p>}
          {offer.discount_text && <div className="inline-flex font-body font-bold text-sm px-4 py-2 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg,#c6a74d,#e8c96a)", color: "#1a1a0a" }}>{offer.discount_text}</div>}
          <div className="flex items-center gap-2 text-white/80 group-hover:text-white font-body text-sm pt-1">Shop Now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
        </div>
      </div>
    );
  }

  if (layout === "thumbnail") {
    return (
      <div className="relative flex items-center gap-6 h-48 px-8 overflow-hidden" style={{ backgroundColor: offer.bg_color }}>
        {offer.image && (
          <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="space-y-2">
          {offer.badge && <span className="inline-block bg-white/20 text-white font-body text-xs px-3 py-1 rounded-full">{offer.badge}</span>}
          <h2 className="font-display text-xl text-white font-semibold">{offer.title}</h2>
          {offer.subtitle && <p className="font-body text-white/75 text-sm">{offer.subtitle}</p>}
          {offer.discount_text && <div className="inline-flex font-body font-bold text-sm px-3 py-1.5 rounded-full" style={{ background: "linear-gradient(135deg,#c6a74d,#e8c96a)", color: "#1a1a0a" }}>{offer.discount_text}</div>}
          <div className="flex items-center gap-2 text-white/80 group-hover:text-white font-body text-sm">Shop Now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></div>
        </div>
      </div>
    );
  }

  // full-bg (default)
  return (
    <div
      className="relative h-64 md:h-72 overflow-hidden"
      style={{
        backgroundColor: offer.bg_color,
        backgroundImage: offer.image ? `url(${offer.image})` : undefined,
        backgroundSize: size,
        backgroundPosition: position,
      }}
    >
      {offer.image && <div className="absolute inset-0 transition-opacity duration-500" style={{ background: overlayBg }} />}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: "linear-gradient(90deg, transparent 5%, #c6a74d 30%, #f0d878 50%, #c6a74d 70%, transparent 95%)" }} />
      <div className="absolute inset-0 flex flex-col justify-between p-8 z-10">
        <div>
          {offer.badge && (
            <span className="inline-block font-body text-[11px] font-semibold px-3 py-1 rounded-full tracking-wider uppercase"
              style={{ background: "rgba(198,167,77,0.18)", border: "1px solid rgba(198,167,77,0.5)", color: "#e8c96a", backdropFilter: "blur(8px)" }}>
              {offer.badge}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl md:text-3xl text-white font-bold leading-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{offer.title}</h2>
          {offer.subtitle && <p className="font-body text-white/75 text-sm">{offer.subtitle}</p>}
          {offer.discount_text && (
            <div className="inline-flex font-body font-bold text-sm px-4 py-2 rounded-full shadow-lg" style={{ background: "linear-gradient(135deg,#c6a74d,#e8c96a)", color: "#1a1a0a" }}>
              {offer.discount_text}
            </div>
          )}
          <div className="flex items-center gap-2 text-white/80 group-hover:text-white font-body text-sm pt-1 transition-colors">
            Shop Now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferExt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOffers(true).then(data => {
      const now = new Date();
      setOffers((data as OfferExt[]).filter(o => !o.expires_at || new Date(o.expires_at) > now));
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
                  <Link to={offer.link || "/shop"} className="group block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                    style={{ border: "1px solid rgba(198,167,77,0.2)" }}>
                    <OfferBanner offer={offer} />
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
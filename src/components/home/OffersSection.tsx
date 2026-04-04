import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import { getOffers, type Offer } from "@/lib/sharedStore";

type OfferExt = Offer & {
  img_position?: string;
  img_size?: string;
  img_layout?: string;
  overlay_opacity?: number;
  show_gradient?: boolean;
};

export default function OffersSection() {
  const [offers, setOffers] = useState<OfferExt[]>([]);

  useEffect(() => {
    getOffers(true).then(data => {
      const now = new Date();
      setOffers(
        (data as OfferExt[])
          .filter(o => !o.expires_at || new Date(o.expires_at) > now)
          .slice(0, 3)
      );
    });
  }, []);

  if (offers.length === 0) return null;

  return (
    <section className="section-spacing bg-muted/30">
      <div className="container-premium">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
          <div>
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">
              Promotions
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mt-1">
              Current Offers
            </h2>
          </div>
          <Link
            to="/offers"
            className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div
          className={`grid gap-4 sm:gap-5 ${
            offers.length === 1
              ? "grid-cols-1 max-w-2xl"
              : offers.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {offers.map((offer, i) => {
            const layout   = offer.img_layout ?? "full-bg";
            const opacity  = offer.overlay_opacity ?? 0.55;
            const gradient = offer.show_gradient ?? true;
            const position = offer.img_position ?? "center";
            const size     = offer.img_size ?? "cover";

            const overlayBg = gradient
              ? `linear-gradient(160deg, rgba(0,0,0,${opacity * 0.7}) 0%, rgba(0,0,0,${opacity * 0.2}) 40%, rgba(0,0,0,${opacity}) 100%)`
              : `rgba(0,0,0,${opacity})`;

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={offer.link || "/shop"}
                  className="group block relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500"
                  style={{ border: "1px solid rgba(198,167,77,0.18)" }}
                >
                  {/* ── Full background layout ── */}
                  {layout === "full-bg" && (
                    <div
                      className="relative h-48 sm:h-52 md:h-56 overflow-hidden"
                      style={{
                        backgroundColor: offer.bg_color,
                        backgroundImage: offer.image ? `url(${offer.image})` : undefined,
                        backgroundSize: size,
                        backgroundPosition: position,
                      }}
                    >
                      {offer.image && (
                        <div className="absolute inset-0" style={{ background: overlayBg }} />
                      )}
                      {/* Gold top line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px] z-10"
                        style={{ background: "linear-gradient(90deg, transparent 5%, #c6a74d 35%, #f0d878 50%, #c6a74d 70%, transparent 95%)" }}
                      />
                      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-6 z-10">
                        <div>
                          {offer.badge && (
                            <span
                              className="inline-flex items-center gap-1 font-body text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase"
                              style={{
                                background: "rgba(198,167,77,0.18)",
                                border: "1px solid rgba(198,167,77,0.5)",
                                color: "#e8c96a",
                              }}
                            >
                              <Tag size={8} /> {offer.badge}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <h3
                            className="font-display text-lg sm:text-xl text-white font-bold leading-tight"
                            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
                          >
                            {offer.title}
                          </h3>
                          {offer.subtitle && (
                            <p className="font-body text-white/70 text-xs line-clamp-2">
                              {offer.subtitle}
                            </p>
                          )}
                          {offer.discount_text && (
                            <div
                              className="inline-block font-body font-bold text-xs px-3 py-1.5 rounded-full shadow"
                              style={{
                                background: "linear-gradient(135deg, #c6a74d, #e8c96a)",
                                color: "#1a1a0a",
                              }}
                            >
                              {offer.discount_text}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-white/80 group-hover:text-white font-body text-xs pt-0.5 transition-colors">
                            Shop Now <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Side image layout ── */}
                  {layout === "side-image" && (
                    <div
                      className="relative flex items-center h-48 sm:h-52 overflow-hidden px-5 sm:px-8"
                      style={{ backgroundColor: offer.bg_color }}
                    >
                      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full opacity-10 bg-white" />
                      {offer.image && (
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="absolute right-4 bottom-0 h-40 sm:h-44 object-contain opacity-90 transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="relative z-10 space-y-2 max-w-[60%]">
                        {offer.badge && (
                          <span className="inline-flex items-center gap-1 bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full">
                            <Tag size={8} /> {offer.badge}
                          </span>
                        )}
                        <h3 className="font-display text-lg sm:text-xl text-white font-semibold leading-tight">{offer.title}</h3>
                        {offer.subtitle && <p className="font-body text-white/70 text-xs line-clamp-2">{offer.subtitle}</p>}
                        {offer.discount_text && (
                          <div
                            className="inline-block font-body font-bold text-xs px-3 py-1.5 rounded-full shadow"
                            style={{ background: "linear-gradient(135deg, #c6a74d, #e8c96a)", color: "#1a1a0a" }}
                          >
                            {offer.discount_text}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-white/80 group-hover:text-white font-body text-xs pt-0.5 transition-colors">
                          Shop Now <ArrowRight size={11} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Thumbnail layout ── */}
                  {layout === "thumbnail" && (
                    <div
                      className="relative flex items-center gap-4 h-36 sm:h-40 overflow-hidden px-5"
                      style={{ backgroundColor: offer.bg_color }}
                    >
                      {offer.image && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                          <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="space-y-1 flex-1 min-w-0">
                        {offer.badge && <span className="inline-block bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full">{offer.badge}</span>}
                        <h3 className="font-display text-base sm:text-lg text-white font-semibold truncate">{offer.title}</h3>
                        {offer.subtitle && <p className="font-body text-white/70 text-xs line-clamp-1">{offer.subtitle}</p>}
                        {offer.discount_text && (
                          <div
                            className="inline-block font-body font-bold text-xs px-2.5 py-1 rounded-full"
                            style={{ background: "linear-gradient(135deg, #c6a74d, #e8c96a)", color: "#1a1a0a" }}
                          >
                            {offer.discount_text}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
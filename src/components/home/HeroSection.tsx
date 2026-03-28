import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Tag } from "lucide-react";
import heroImg from "@/assets/Home.jpeg";
import { getOffers, type Offer } from "@/lib/sharedStore";

const HeroSection = () => {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    getOffers(true).then(data => {
      const now = new Date();
      setOffers(data.filter(o => !o.expires_at || new Date(o.expires_at) > now).slice(0, 3));
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      {/* ── Warm Golden Bokeh Background ── */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base warm cream gradient */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #fdf6e3 0%, #faecd0 40%, #f5e0b5 70%, #eedfa8 100%)" }} />

        {/* Large soft bokeh blobs */}
        <div className="absolute rounded-full blur-[90px] opacity-60"
          style={{ width: 520, height: 520, top: -80, left: -100,
            background: "radial-gradient(circle, #f5c842 0%, #e8a020 60%, transparent 100%)" }} />
        <div className="absolute rounded-full blur-[110px] opacity-50"
          style={{ width: 600, height: 600, top: 100, right: -150,
            background: "radial-gradient(circle, #f0d060 0%, #d4900a 60%, transparent 100%)" }} />
        <div className="absolute rounded-full blur-[80px] opacity-40"
          style={{ width: 380, height: 380, bottom: 50, left: "30%",
            background: "radial-gradient(circle, #fce48a 0%, #e6b030 70%, transparent 100%)" }} />
        <div className="absolute rounded-full blur-[70px] opacity-35"
          style={{ width: 280, height: 280, top: "20%", left: "40%",
            background: "radial-gradient(circle, #fff0a0 0%, #f0c040 70%, transparent 100%)" }} />

        {/* Small sparkle bokeh dots */}
        {[
          { w: 120, h: 120, top: "10%",  left: "15%",  op: 0.5 },
          { w: 90,  h: 90,  top: "60%",  left: "5%",   op: 0.4 },
          { w: 160, h: 160, top: "30%",  left: "55%",  op: 0.3 },
          { w: 100, h: 100, top: "75%",  left: "70%",  op: 0.45 },
          { w: 70,  h: 70,  top: "5%",   left: "70%",  op: 0.35 },
          { w: 130, h: 130, top: "50%",  left: "80%",  op: 0.3 },
          { w: 80,  h: 80,  top: "85%",  left: "40%",  op: 0.4 },
          { w: 110, h: 110, top: "15%",  left: "85%",  op: 0.25 },
        ].map((b, i) => (
          <div key={i} className="absolute rounded-full blur-[40px]"
            style={{
              width: b.w, height: b.h, top: b.top, left: b.left, opacity: b.op,
              background: "radial-gradient(circle, #fde68a 0%, #f59e0b 60%, transparent 100%)"
            }} />
        ))}

        {/* Subtle warm vignette overlay */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(180,120,20,0.12) 100%)" }} />
      </div>
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh] py-16 lg:py-0">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} className="space-y-8 text-center lg:text-left">
            <div>
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-block font-body text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4">
                Premium Gifting · UAE
              </motion.span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] text-foreground">
                Nature's Finest,{" "}<span className="text-gradient-gold">Wrapped</span>{" "}for Them
              </h1>
            </div>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Hand-picked premium fruits, luxury dates, and artisan nut collections. Beautifully gift-wrapped and delivered fresh across the UAE.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/shop" className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold flex items-center gap-2 hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20">
                Shop Gift Boxes <ArrowRight size={18} />
              </Link>
              <Link to="/build-your-box" className="px-8 py-4 border-2 border-foreground/10 text-foreground rounded-full font-body text-sm font-semibold flex items-center gap-2 hover:border-primary hover:text-primary transition-all btn-press">
                Build Your Box
              </Link>
            </div>
            {offers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 flex-wrap justify-center lg:justify-start pt-2">
                <Tag size={14} className="text-gold flex-shrink-0" />
                {offers.map((offer, i) => (
                  <Link key={offer.id} to={offer.link || "/offers"} className="group flex items-center gap-2">
                    <span className="font-body text-xs font-semibold px-3 py-1.5 rounded-full transition-all group-hover:brightness-90" style={{ backgroundColor: offer.bg_color + "20", color: offer.bg_color }}>
                      {offer.discount_text || offer.title}
                    </span>
                    {i < offers.length - 1 && <span className="text-muted-foreground/30">·</span>}
                  </Link>
                ))}
                <Link to="/offers" className="font-body text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  All offers <ArrowRight size={11} />
                </Link>
              </motion.div>
            )}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-2">
              <div className="text-center"><p className="font-display text-2xl font-semibold text-foreground">10K+</p><p className="font-body text-xs text-muted-foreground">Happy Customers</p></div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center"><p className="font-display text-2xl font-semibold text-foreground">4.9★</p><p className="font-body text-xs text-muted-foreground">Average Rating</p></div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center"><p className="font-display text-2xl font-semibold text-foreground">24h</p><p className="font-body text-xs text-muted-foreground">UAE Delivery</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img src={heroImg} alt="Premium fruit gift box by FruitFlix UAE" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-4 -left-4 md:left-8 glass rounded-2xl p-4 shadow-lg">
              <p className="font-body text-xs text-muted-foreground">Free Delivery</p>
              <p className="font-display text-lg font-semibold">Across UAE 🇦🇪</p>
            </motion.div>
            {offers.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="absolute -top-4 right-4 md:right-8 glass rounded-2xl px-4 py-3 shadow-lg border border-gold/20">
                <p className="font-body text-xs text-muted-foreground">Current Offer</p>
                <p className="font-display text-sm font-semibold text-primary">{offers[0]?.discount_text || offers[0]?.title}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
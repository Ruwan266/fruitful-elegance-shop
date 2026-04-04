import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Truck, Clock } from "lucide-react";

const STORAGE_KEY = "fruitflix_pricedrop_dismissed_at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

// ── Edit prices here ──────────────────────────────────────────────
const OFFERS = [
  { label: "Small Box",  original: 199, sale: 179 },
  { label: "Medium Box", original: 299, sale: 249 },
  { label: "Large Box",  original: 450, sale: 360 },
] as const;

const LeafAccent = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 80" fill="none" className={className} aria-hidden="true">
    <path d="M30 78 C30 78 2 50 2 30 C2 14 14 2 30 2 C46 2 58 14 58 30 C58 50 30 78 30 78Z" fill="currentColor" opacity="0.18" />
    <path d="M30 78 C30 78 8 52 8 34 C8 18 18 8 30 8" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
  </svg>
);

const PriceTile = ({ label, original, sale, index }: { label: string; original: number; sale: number; index: number }) => {
  const discount = Math.round((1 - sale / original) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 + index * 0.08, duration: 0.4 }}
      className="relative flex items-center justify-between gap-3 rounded-2xl px-5 py-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,253,245,0.95) 100%)",
        boxShadow: "0 2px 12px rgba(26, 64, 26, 0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: "1px solid rgba(198,167,77,0.22)",
      }}
    >
      <LeafAccent className="absolute -right-2 -top-2 w-12 h-16 text-[#1a401a]" />
      <span
        className="absolute top-2.5 right-3 text-[10px] font-bold tracking-wide rounded-full px-2 py-0.5 z-10"
        style={{ background: "linear-gradient(135deg, #c6a74d 0%, #e8c96a 100%)", color: "#1a1a0a" }}
      >
        -{discount}%
      </span>
      <p className="text-sm font-semibold z-10 relative" style={{ color: "#2d5a2d", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
        {label}
      </p>
      <div className="flex items-baseline gap-3 z-10 relative">
        <span className="text-sm line-through decoration-[#c6a74d] decoration-2" style={{ color: "#9a9a8a" }}>
          AED {original}
        </span>
        <span className="text-xl font-extrabold tracking-tight" style={{ color: "#1a401a", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          AED {sale}
        </span>
      </div>
    </motion.div>
  );
};

const WelcomePopup = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const scheduled = useRef(false);

  useEffect(() => {
    if (scheduled.current) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && Date.now() - parseInt(raw, 10) < COOLDOWN_MS) return;
    } catch {}
    scheduled.current = true;
    const t = setTimeout(() => setVisible(true), 1700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (visible) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
  };

  const handleShopNow = () => { dismiss(); navigate("/shop"); };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <AnimatePresence>
        {visible && (
          <>
            <motion.div
              key="ff-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-[9998]"
              style={{ background: "rgba(8,24,8,0.55)", backdropFilter: "blur(3px)" }}
              onClick={dismiss}
            />

            <motion.div
              key="ff-modal"
              initial={{ opacity: 0, scale: 0.86, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 340 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none"
            >
              <div
                className="relative w-full max-w-[420px] pointer-events-auto overflow-hidden"
                style={{ borderRadius: "28px", background: "#f8f6ee", boxShadow: "0 40px 100px -10px rgba(0,0,0,0.38), 0 0 0 1px rgba(198,167,77,0.18)" }}
              >
                {/* Gold line at top */}
                <div className="absolute top-0 left-8 right-8 h-[3px] rounded-b-full z-10" style={{ background: "linear-gradient(90deg, transparent, #c6a74d, #e8c96a, #c6a74d, transparent)" }} />

                {/* Header */}
                <div className="relative overflow-hidden px-8 pt-9 pb-7 text-center" style={{ background: "linear-gradient(160deg, #1a401a 0%, #0f2a0f 55%, #1c3a14 100%)" }}>
                  <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full opacity-10 bg-[#c6a74d]" />
                  <div className="absolute -bottom-16 -right-10 w-52 h-52 rounded-full opacity-[0.08] bg-[#c6a74d]" />
                  <LeafAccent className="absolute bottom-0 left-4 w-10 h-14 text-[#c6a74d] rotate-[-15deg]" />
                  <LeafAccent className="absolute top-2 right-6 w-8 h-12 text-[#c6a74d] rotate-[20deg]" />

                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-5 text-[10px] font-semibold tracking-[0.12em] uppercase"
                    style={{ background: "rgba(198,167,77,0.18)", border: "1px solid rgba(198,167,77,0.45)", color: "#e8c96a" }}
                  >
                    <Clock size={9} /> Limited-Time Offer
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Flame size={20} className="text-orange-400" fill="currentColor" />
                      <h2 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        Big Price Drop
                      </h2>
                    </div>
                    <p className="text-base font-light" style={{ color: "#c6a74d", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.02em" }}>
                      Premium Fruit Gift Boxes
                    </p>
                  </motion.div>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="mt-3 text-[12.5px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    We've reduced our prices to give you<br />more value this season.
                  </motion.p>
                </div>

                {/* Price tiles */}
                <div className="px-5 py-5 space-y-3">
                  {OFFERS.map((offer, i) => <PriceTile key={offer.label} {...offer} index={i} />)}
                </div>

                {/* Divider */}
                <div className="mx-5 h-px" style={{ background: "rgba(198,167,77,0.15)" }} />

                {/* CTA */}
                <div className="px-5 pb-6 pt-4 space-y-3">
                  <motion.button
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                    onClick={handleShopNow}
                    className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide transition-all active:scale-[0.97]"
                    style={{ background: "linear-gradient(135deg, #1a401a 0%, #2d5a2d 100%)", color: "#fff", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 24px rgba(26,64,26,0.35)" }}
                    onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.12)")}
                    onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                  >
                    Shop Now →
                  </motion.button>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.48 }}
                    className="flex items-center justify-center gap-1.5 text-[11px]"
                    style={{ color: "#7a8a7a", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <Truck size={11} /> Free delivery on orders above AED 200
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.52 }}
                    onClick={dismiss}
                    className="w-full text-center text-[11px] transition-colors"
                    style={{ color: "#9a9a8a", fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9a9a8a")}
                  >
                    No thanks, I'll pay full price
                  </motion.button>
                </div>

                {/* Close button */}
                <button
                  onClick={dismiss} aria-label="Close popup"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default WelcomePopup;
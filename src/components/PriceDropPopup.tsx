import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Truck, Clock, Gift } from "lucide-react";
import heroImg from "@/assets/hero-giftbox.jpg";

// ─── Tab close කළාම reset වෙනවා (sessionStorage) ─────────────────
const STORAGE_KEY = "fruitflix_pricedrop_v2";

// ─── Edit prices here freely ──────────────────────────────────────
const OFFERS = [
  { label: "Small Box",  original: 199, sale: 179 },
  { label: "Medium Box", original: 299, sale: 249 },
  { label: "Large Box",  original: 450, sale: 360 },
] as const;

// ─── Price row component ──────────────────────────────────────────
const PriceRow = ({
  label, original, sale, index,
}: { label: string; original: number; sale: number; index: number }) => {
  const pct = Math.round((1 - sale / original) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 + index * 0.09, duration: 0.38 }}
      className="flex items-center justify-between rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(198,167,77,0.25)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: "linear-gradient(135deg,#c6a74d,#e8c96a)", color: "#1a1a0a" }}
        >
          -{pct}%
        </span>
        <span style={{ color: "#f0ead8", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "15px", fontWeight: 600 }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-sm line-through"
          style={{ color: "rgba(240,234,216,0.45)", textDecorationColor: "#c6a74d" }}
        >
          AED {original}
        </span>
        <span
          style={{
            color: "#e8c96a",
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: "20px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          AED {sale}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Main popup ───────────────────────────────────────────────────
const PriceDropPopup = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const scheduled = useRef(false);

  // Tab open වෙන සැරේ check කරනවා — close කළාම session clear වෙනවා
  useEffect(() => {
    if (scheduled.current) return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return; // ← දැනටමත් close කළා නම් නොපෙනෙයි
    } catch {}
    scheduled.current = true;
    const t = setTimeout(() => setVisible(true), 1700);
    return () => clearTimeout(t);
  }, []);

  // ESC key close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") dismiss(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch {} // ← sessionStorage
  };

  const handleShop = () => { dismiss(); navigate("/shop"); };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <AnimatePresence>
        {visible && (
          <>
            {/* Backdrop */}
            <motion.div
              key="pd-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[9998]"
              style={{ background: "rgba(4,14,4,0.72)", backdropFilter: "blur(4px)" }}
              onClick={dismiss}
            />

            {/* Modal */}
            <motion.div
              key="pd-modal"
              initial={{ opacity: 0, scale: 0.84, y: 36 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none"
            >
              <div
                className="relative w-full max-w-[460px] pointer-events-auto overflow-hidden"
                style={{
                  borderRadius: "24px",
                  background: "linear-gradient(160deg, #0e280e 0%, #0a1e0a 40%, #111f0a 100%)",
                  boxShadow: "0 48px 120px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(198,167,77,0.3), inset 0 1px 0 rgba(198,167,77,0.15)",
                }}
              >
                {/* Gold shimmer top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] z-20"
                  style={{ background: "linear-gradient(90deg, transparent 5%, #c6a74d 30%, #f0d878 50%, #c6a74d 70%, transparent 95%)" }}
                />

                {/* Image Section */}
                <div className="relative h-[185px] overflow-hidden">
                  <img
                    src={heroImg}
                    alt="Premium Fruit Gift Boxes"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center 60%" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, rgba(10,30,10,0.35) 0%, rgba(10,30,10,0.1) 40%, rgba(10,30,10,0.85) 100%)" }}
                  />

                  {/* Brand badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(10,30,10,0.75)", border: "1px solid rgba(198,167,77,0.5)", backdropFilter: "blur(8px)" }}
                    >
                      <Gift size={11} style={{ color: "#c6a74d" }} />
                      <span style={{ color: "#e8c96a", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "'DM Sans',sans-serif" }}>
                        FRUITFLIX UAE
                      </span>
                    </div>
                  </div>

                  {/* Limited time badge */}
                  <div
                    className="absolute top-4 right-12 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(198,167,77,0.15)", border: "1px solid rgba(198,167,77,0.4)", backdropFilter: "blur(8px)" }}
                  >
                    <Clock size={9} style={{ color: "#e8c96a" }} />
                    <span style={{ color: "#e8c96a", fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "'DM Sans',sans-serif" }}>
                      LIMITED TIME
                    </span>
                  </div>

                  {/* Heading over image */}
                  <div className="absolute bottom-4 left-5 right-5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Flame size={18} fill="#f97316" style={{ color: "#f97316" }} />
                      <h2
                        style={{
                          fontFamily: "'Cormorant Garamond',Georgia,serif",
                          fontSize: "22px", fontWeight: 800,
                          color: "#fff", letterSpacing: "-0.01em", lineHeight: 1.1,
                        }}
                      >
                        Big Price Drop
                      </h2>
                    </div>
                    <p style={{ color: "#c6a74d", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: "14px", fontStyle: "italic" }}>
                      Premium Fruit Gift Boxes
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 pt-4 pb-2">
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
                    className="text-center text-[12px] mb-4"
                    style={{ color: "rgba(240,234,216,0.55)", fontFamily: "'DM Sans',sans-serif" }}
                  >
                    We've reduced our prices to give you more value this season
                  </motion.p>

                  <div className="space-y-2">
                    {OFFERS.map((o, i) => <PriceRow key={o.label} {...o} index={i} />)}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="mt-3 flex items-center justify-center gap-1.5"
                  >
                    <span style={{ fontSize: "11px", color: "rgba(240,234,216,0.4)", fontFamily: "'DM Sans',sans-serif" }}>💡 Save up to</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#e8c96a", fontFamily: "'DM Sans',sans-serif" }}>20% OFF</span>
                    <span style={{ fontSize: "11px", color: "rgba(240,234,216,0.4)", fontFamily: "'DM Sans',sans-serif" }}>on premium boxes</span>
                  </motion.div>
                </div>

                {/* Divider */}
                <div className="mx-5 my-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(198,167,77,0.3), transparent)" }} />

                {/* CTA */}
                <div className="px-5 pb-5 space-y-2.5">
                  <motion.button
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52 }}
                    onClick={handleShop}
                    className="w-full py-4 rounded-xl font-semibold text-sm tracking-wider uppercase transition-all active:scale-[0.97]"
                    style={{
                      background: "linear-gradient(135deg, #c6a74d 0%, #e8c96a 50%, #c6a74d 100%)",
                      color: "#0a1e0a",
                      fontFamily: "'DM Sans',sans-serif",
                      boxShadow: "0 8px 28px rgba(198,167,77,0.35)",
                      letterSpacing: "0.08em",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={e => (e.currentTarget.style.filter = "none")}
                  >
                    Shop Now →
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58 }}
                    className="flex items-center justify-center gap-1.5"
                    style={{ color: "rgba(240,234,216,0.35)", fontFamily: "'DM Sans',sans-serif", fontSize: "11px" }}
                  >
                    <Truck size={10} />
                    Delivery across UAE
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}
                    onClick={dismiss}
                    className="w-full text-center text-[11px] transition-colors pt-0.5"
                    style={{ color: "rgba(240,234,216,0.28)", fontFamily: "'DM Sans',sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(240,234,216,0.55)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(240,234,216,0.28)")}
                  >
                    No thanks, I'll pay full price
                  </motion.button>
                </div>

                {/* Close button */}
                <button
                  onClick={dismiss} aria-label="Close"
                  className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ background: "rgba(10,30,10,0.7)", border: "1px solid rgba(198,167,77,0.3)", color: "rgba(240,234,216,0.7)", backdropFilter: "blur(8px)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(198,167,77,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(198,167,77,0.3)")}
                >
                  <X size={13} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PriceDropPopup;
import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Tag, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllOffers, upsertOffer, deleteOffer as deleteoff,
  fileToBase64, type Offer,
} from "@/lib/sharedStore";

// ─── Extended Offer with image display settings ───────────────────
type OfferExt = Offer & {
  img_position?: string;
  img_size?: string;
  img_layout?: string;
  overlay_opacity?: number;
  show_gradient?: boolean;
};

const BG_PRESETS = [
  { label: "Forest Green", value: "#2d5a27" },
  { label: "Gold",         value: "#8B6914" },
  { label: "Burgundy",     value: "#7B1D1D" },
  { label: "Deep Blue",    value: "#1E3A5F" },
  { label: "Midnight",     value: "#1a1a2e" },
  { label: "Teal",         value: "#0d5c5c" },
];

const POSITIONS = ["center", "top", "bottom", "left", "right"];
const LAYOUTS   = ["full-bg", "side-image", "thumbnail"];
const LAYOUT_LABELS: Record<string, string> = {
  "full-bg":    "Full Background",
  "side-image": "Side Image",
  "thumbnail":  "Thumbnail",
};

const EMPTY: Omit<OfferExt, "id"> = {
  title: "", subtitle: "", badge: "", discount_text: "",
  image: "", link: "/shop", bg_color: "#2d5a27",
  is_active: true, sort_order: 0, expires_at: "",
  img_position: "center", img_size: "cover",
  img_layout: "full-bg", overlay_opacity: 0.55,
  show_gradient: true,
};

// ─── Shared card renderer (used for list + preview) ───────────────
function OfferCardInner({ offer, height = "h-44" }: { offer: Omit<OfferExt, "id"> & Partial<Pick<OfferExt, "id">>; height?: string }) {
  const layout   = offer.img_layout ?? "full-bg";
  const opacity  = offer.overlay_opacity ?? 0.55;
  const gradient = offer.show_gradient ?? true;
  const position = offer.img_position ?? "center";
  const size     = offer.img_size ?? "cover";

  const overlayBg = gradient
    ? `linear-gradient(160deg, rgba(0,0,0,${opacity * 0.7}) 0%, rgba(0,0,0,${opacity * 0.2}) 40%, rgba(0,0,0,${opacity}) 100%)`
    : `rgba(0,0,0,${opacity})`;

  // ── Full background layout ────────────────────────────────────
  if (layout === "full-bg") {
    return (
      <div
        className={`relative ${height} overflow-hidden`}
        style={{
          backgroundColor: offer.bg_color,
          backgroundImage: offer.image ? `url(${offer.image})` : undefined,
          backgroundSize: size,
          backgroundPosition: position,
        }}
      >
        {offer.image && <div className="absolute inset-0" style={{ background: overlayBg }} />}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent 5%, #c6a74d 35%, #f0d878 50%, #c6a74d 70%, transparent 95%)" }} />
        <div className="absolute inset-0 flex flex-col justify-between p-5 z-10">
          <div>
            {offer.badge && (
              <span className="inline-block font-body text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wider uppercase"
                style={{ background: "rgba(198,167,77,0.2)", border: "1px solid rgba(198,167,77,0.5)", color: "#e8c96a" }}>
                {offer.badge}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-white text-xl font-bold leading-tight" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
              {offer.title || "Offer Title"}
            </h3>
            {offer.subtitle && <p className="font-body text-white/75 text-xs">{offer.subtitle}</p>}
            {offer.discount_text && (
              <span className="inline-block font-body text-xs font-bold px-3 py-1 rounded-full mt-1"
                style={{ background: "linear-gradient(135deg, #c6a74d, #e8c96a)", color: "#1a1a0a" }}>
                {offer.discount_text}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Side image layout ─────────────────────────────────────────
  if (layout === "side-image") {
    return (
      <div className={`relative flex items-center ${height} overflow-hidden px-6`} style={{ backgroundColor: offer.bg_color }}>
        {offer.image && <img src={offer.image} alt="" className="absolute right-4 bottom-0 h-[90%] object-contain opacity-90" />}
        <div className="absolute inset-0" style={{ background: overlayBg, opacity: 0.3 }} />
        <div className="relative z-10 space-y-1.5 max-w-[55%]">
          {offer.badge && <span className="inline-block bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full">{offer.badge}</span>}
          <h3 className="font-display text-white text-lg font-semibold">{offer.title || "Offer Title"}</h3>
          {offer.subtitle && <p className="font-body text-white/70 text-xs">{offer.subtitle}</p>}
          {offer.discount_text && (
            <span className="inline-block font-body text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "linear-gradient(135deg, #c6a74d, #e8c96a)", color: "#1a1a0a" }}>
              {offer.discount_text}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Thumbnail layout ──────────────────────────────────────────
  return (
    <div className={`flex items-center gap-4 ${height} overflow-hidden px-5`} style={{ backgroundColor: offer.bg_color }}>
      {offer.image && (
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img src={offer.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="space-y-1 flex-1">
        {offer.badge && <span className="inline-block bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full">{offer.badge}</span>}
        <h3 className="font-display text-white text-base font-semibold">{offer.title || "Offer Title"}</h3>
        {offer.subtitle && <p className="font-body text-white/70 text-xs">{offer.subtitle}</p>}
        {offer.discount_text && (
          <span className="inline-block font-body text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #c6a74d, #e8c96a)", color: "#1a1a0a" }}>
            {offer.discount_text}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Offers() {
  const [offers, setOffers]       = useState<OfferExt[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<OfferExt | null>(null);
  const [form, setForm]           = useState<Omit<OfferExt, "id">>({ ...EMPTY });
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setOffers(await getAllOffers() as OfferExt[]);
    setLoading(false);
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); }
  function openEdit(o: OfferExt) {
    setEditing(o);
    setForm({
      title: o.title, subtitle: o.subtitle, badge: o.badge,
      discount_text: o.discount_text, image: o.image, link: o.link,
      bg_color: o.bg_color, is_active: o.is_active, sort_order: o.sort_order,
      expires_at: o.expires_at,
      img_position: o.img_position ?? "center",
      img_size: o.img_size ?? "cover",
      img_layout: o.img_layout ?? "full-bg",
      overlay_opacity: o.overlay_opacity ?? 0.55,
      show_gradient: o.show_gradient ?? true,
    });
    setShowModal(true);
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setForm(p => ({ ...p, image: base64 }));
      toast({ title: "Image ready ✓" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  }

  async function save() {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await upsertOffer({ ...(editing ? { id: editing.id } : {}), ...form });
      toast({ title: editing ? "Offer updated ✓" : "Offer created ✓" });
      setShowModal(false);
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteoff(id);
    toast({ title: "Deleted" });
    load();
  }

  async function toggleActive(o: OfferExt) {
    await upsertOffer({ id: o.id, is_active: !o.is_active });
    load();
  }

  const f = (key: keyof typeof form, val: any) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Offers & Promotions</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">{offers.filter(o => o.is_active).length} active · visible to all customers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
          <Plus size={16} /> Add Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Tag size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No offers yet.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium">Add Offer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offers.map(offer => (
            <div key={offer.id} className={`rounded-2xl overflow-hidden shadow-lg transition-all ${!offer.is_active ? "opacity-50" : ""}`}
              style={{ border: "1px solid rgba(198,167,77,0.2)" }}>
              <OfferCardInner offer={offer} />
              <div className="bg-card border-t p-3 flex items-center gap-2" style={{ borderColor: "rgba(198,167,77,0.15)" }}>
                <span className="font-body text-xs text-muted-foreground flex-1 truncate">→ {offer.link}</span>
                <button onClick={() => toggleActive(offer)} className={`p-1.5 rounded-lg transition-all ${offer.is_active ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}>
                  {offer.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => openEdit(offer)} className="p-1.5 rounded-lg hover:bg-muted transition-all"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(offer.id, offer.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Offer" : "Create Offer"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-5">

              {/* ── Live Preview ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</span>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <button onClick={() => setPreviewMode("desktop")} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-body transition-all ${previewMode === "desktop" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                      <Monitor size={12} /> Desktop
                    </button>
                    <button onClick={() => setPreviewMode("mobile")} className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-body transition-all ${previewMode === "mobile" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                      <Smartphone size={12} /> Mobile
                    </button>
                  </div>
                </div>
                <div className={`rounded-xl overflow-hidden transition-all ${previewMode === "mobile" ? "max-w-[320px] mx-auto" : "w-full"}`}>
                  <OfferCardInner offer={form} height="h-40" />
                </div>
              </div>

              <hr className="border-border" />

              {/* ── Content fields ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => f("title", e.target.value)} placeholder="e.g. Ramadan Special"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Badge Text</label>
                  <input value={form.badge} onChange={e => f("badge", e.target.value)} placeholder="e.g. Limited Time"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Subtitle</label>
                <input value={form.subtitle} onChange={e => f("subtitle", e.target.value)} placeholder="e.g. Premium gift boxes"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Discount / CTA Text</label>
                  <input value={form.discount_text} onChange={e => f("discount_text", e.target.value)} placeholder="e.g. Save up to 20% OFF"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Link URL</label>
                  <input value={form.link} onChange={e => f("link", e.target.value)} placeholder="/shop"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              {/* ── Image upload ── */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Offer Image</label>
                <div onClick={() => fileRef.current?.click()}
                  className="h-28 bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                  {form.image ? (
                    <><img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"><Upload size={18} className="text-white" /></div></>
                  ) : (
                    <div className="text-center">
                      {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        : <><Upload size={20} className="text-muted-foreground mx-auto mb-1" /><p className="font-body text-xs text-muted-foreground">Upload image</p></>}
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                {form.image && <button onClick={() => f("image", "")} className="mt-1 text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1"><X size={10} /> Remove</button>}
              </div>

              {/* ── Image Display Controls ── */}
              <div className="rounded-xl border border-border p-4 space-y-4 bg-muted/30">
                <p className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image Display Settings</p>

                {/* Layout mode */}
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Layout Mode</label>
                  <div className="flex gap-2">
                    {LAYOUTS.map(l => (
                      <button key={l} onClick={() => f("img_layout", l)}
                        className={`flex-1 py-2 rounded-xl font-body text-xs font-medium transition-all border ${form.img_layout === l ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                        {LAYOUT_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </div>

                {form.img_layout === "full-bg" && (
                  <>
                    {/* Position */}
                    <div>
                      <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Image Position</label>
                      <div className="flex gap-2 flex-wrap">
                        {POSITIONS.map(p => (
                          <button key={p} onClick={() => f("img_position", p)}
                            className={`px-3 py-1.5 rounded-lg font-body text-xs capitalize transition-all border ${form.img_position === p ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div>
                      <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Background Size</label>
                      <div className="flex gap-2">
                        {["cover", "contain"].map(s => (
                          <button key={s} onClick={() => f("img_size", s)}
                            className={`px-4 py-1.5 rounded-lg font-body text-xs capitalize transition-all border ${form.img_size === s ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overlay opacity */}
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="font-body text-xs font-medium text-muted-foreground">Overlay Opacity</label>
                        <span className="font-body text-xs text-muted-foreground">{Math.round((form.overlay_opacity ?? 0.55) * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.05"
                        value={form.overlay_opacity ?? 0.55}
                        onChange={e => f("overlay_opacity", parseFloat(e.target.value))}
                        className="w-full accent-primary" />
                    </div>

                    {/* Gradient toggle */}
                    <div className="flex items-center justify-between">
                      <label className="font-body text-xs font-medium text-muted-foreground">Gradient Overlay</label>
                      <button onClick={() => f("show_gradient", !form.show_gradient)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${form.show_gradient ? "bg-primary" : "bg-muted-foreground/30"}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.show_gradient ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ── Background color ── */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Background Color (fallback)</label>
                <div className="flex gap-2 flex-wrap">
                  {BG_PRESETS.map(p => (
                    <button key={p.value} onClick={() => f("bg_color", p.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.bg_color === p.value ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: p.value }} title={p.label} />
                  ))}
                  <input type="color" value={form.bg_color} onChange={e => f("bg_color", e.target.value)}
                    className="w-8 h-8 rounded-full border border-border cursor-pointer" />
                </div>
              </div>

              {/* ── Expires + Active ── */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Expires (optional)</label>
                  <input type="date" value={form.expires_at} onChange={e => f("expires_at", e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => f("is_active", e.target.checked)} className="rounded" />
                    <span className="font-body text-sm">Active (visible)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-border font-body text-sm hover:bg-muted transition-all">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
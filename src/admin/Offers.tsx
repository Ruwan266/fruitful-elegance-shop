import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Tag, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getStore, setStore, fileToBase64, genId, seedDefaults,
  KEYS, type Offer,
} from "@/lib/jsonStore";

const BG_PRESETS = [
  { label: "Forest Green", value: "#2d5a27" },
  { label: "Gold", value: "#8B6914" },
  { label: "Burgundy", value: "#7B1D1D" },
  { label: "Deep Blue", value: "#1E3A5F" },
  { label: "Midnight", value: "#1a1a2e" },
  { label: "Teal", value: "#0d5c5c" },
];

const EMPTY: Omit<Offer, "id"> = {
  title: "", subtitle: "", badge: "", discount_text: "",
  image: "", link: "/shop", bg_color: "#2d5a27",
  is_active: true, sort_order: 0, expires_at: "",
};

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState<Omit<Offer, "id">>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    seedDefaults();
    load();
  }, []);

  function load() {
    setOffers(getStore<Offer[]>(KEYS.OFFERS, []));
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); }
  function openEdit(o: Offer) {
    setEditing(o);
    setForm({ title: o.title, subtitle: o.subtitle, badge: o.badge, discount_text: o.discount_text, image: o.image, link: o.link, bg_color: o.bg_color, is_active: o.is_active, sort_order: o.sort_order, expires_at: o.expires_at });
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

  function save() {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    const all = getStore<Offer[]>(KEYS.OFFERS, []);
    if (editing) {
      setStore(KEYS.OFFERS, all.map(o => o.id === editing.id ? { ...o, ...form } : o));
    } else {
      setStore(KEYS.OFFERS, [...all, { id: genId(), ...form }]);
    }
    toast({ title: editing ? "Offer updated ✓" : "Offer created ✓" });
    setShowModal(false);
    load();
    setSaving(false);
  }

  function deleteOffer(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const all = getStore<Offer[]>(KEYS.OFFERS, []);
    setStore(KEYS.OFFERS, all.filter(o => o.id !== id));
    toast({ title: "Deleted" });
    load();
  }

  function toggleActive(id: string) {
    const all = getStore<Offer[]>(KEYS.OFFERS, []);
    setStore(KEYS.OFFERS, all.map(o => o.id === id ? { ...o, is_active: !o.is_active } : o));
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Offers & Promotions</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">{offers.filter(o => o.is_active).length} active offers displayed on homepage</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
          <Plus size={16} /> Add Offer
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Tag size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No offers yet. Create your first promotion!</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium">Add Offer</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className={`rounded-2xl overflow-hidden border transition-all ${!offer.is_active ? "opacity-50 border-border" : "border-transparent"}`}>
              {/* Preview Card */}
              <div className="relative h-40 flex items-center px-6" style={{ backgroundColor: offer.bg_color }}>
                {offer.image && (
                  <img src={offer.image} alt="" className="absolute right-4 bottom-0 h-36 object-contain opacity-80" />
                )}
                <div className="relative z-10 space-y-1">
                  {offer.badge && (
                    <span className="inline-block bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full">{offer.badge}</span>
                  )}
                  <h3 className="font-display text-white text-lg font-semibold leading-tight">{offer.title || "Offer Title"}</h3>
                  {offer.subtitle && <p className="font-body text-white/70 text-xs">{offer.subtitle}</p>}
                  {offer.discount_text && (
                    <span className="inline-block bg-white text-sm font-body font-bold px-3 py-1 rounded-full mt-1" style={{ color: offer.bg_color }}>
                      {offer.discount_text}
                    </span>
                  )}
                </div>
              </div>
              {/* Controls */}
              <div className="bg-card border-t border-border p-3 flex items-center gap-2">
                <span className="font-body text-xs text-muted-foreground flex-1 truncate">→ {offer.link}</span>
                <button onClick={() => toggleActive(offer.id)} title={offer.is_active ? "Deactivate" : "Activate"}
                  className={`p-1.5 rounded-lg transition-all ${offer.is_active ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}>
                  {offer.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => openEdit(offer)} className="p-1.5 rounded-lg hover:bg-muted transition-all"><Pencil size={14} /></button>
                <button onClick={() => deleteOffer(offer.id, offer.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Offer" : "Create Offer"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Preview */}
              <div className="relative h-32 rounded-xl overflow-hidden flex items-center px-5" style={{ backgroundColor: form.bg_color }}>
                {form.image && <img src={form.image} alt="" className="absolute right-4 bottom-0 h-28 object-contain opacity-80" />}
                <div className="relative z-10 space-y-1">
                  {form.badge && <span className="inline-block bg-white/20 text-white font-body text-[10px] px-2 py-0.5 rounded-full">{form.badge}</span>}
                  <h3 className="font-display text-white text-base font-semibold">{form.title || "Offer Title"}</h3>
                  {form.subtitle && <p className="font-body text-white/70 text-xs">{form.subtitle}</p>}
                  {form.discount_text && (
                    <span className="inline-block bg-white text-xs font-body font-bold px-2 py-0.5 rounded-full" style={{ color: form.bg_color }}>{form.discount_text}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Ramadan Special"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Badge Text</label>
                  <input value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Limited Time"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="e.g. Premium gift boxes for every occasion"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Discount / CTA Text</label>
                  <input value={form.discount_text} onChange={e => setForm(p => ({ ...p, discount_text: e.target.value }))} placeholder="e.g. 20% OFF"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Link URL</label>
                  <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="/shop"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Background Color</label>
                <div className="flex gap-2 flex-wrap">
                  {BG_PRESETS.map(p => (
                    <button key={p.value} onClick={() => setForm(f => ({ ...f, bg_color: p.value }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.bg_color === p.value ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: p.value }} title={p.label} />
                  ))}
                  <input type="color" value={form.bg_color} onChange={e => setForm(p => ({ ...p, bg_color: e.target.value }))}
                    className="w-8 h-8 rounded-full border border-border cursor-pointer" title="Custom color" />
                </div>
              </div>

              {/* Offer Image */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Offer Image (optional)</label>
                <div onClick={() => fileRef.current?.click()}
                  className="h-28 bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                  {form.image ? (
                    <>
                      <img src={form.image} alt="preview" className="h-full object-contain" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={18} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {uploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : (
                        <><Upload size={20} className="text-muted-foreground mx-auto mb-1" /><p className="font-body text-xs text-muted-foreground">Upload product image</p></>
                      )}
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                {form.image && (
                  <button onClick={() => setForm(p => ({ ...p, image: "" }))} className="mt-1 text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
                    <X size={10} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Expires (optional)</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
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

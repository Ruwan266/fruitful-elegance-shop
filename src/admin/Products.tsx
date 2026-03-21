import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Search, X, Check, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMPTY: any = {
  title: "", slug: "", description: "", price: 0, compare_price: null,
  category: "gift-boxes", badge: null, images: [], sizes: ["S","M","L"],
  colors: ["Forest Green","Gold"], whats_inside: [], tags: [], sku: "",
  in_stock: true, stock_quantity: 999, is_active: true, sort_order: 0,
};

const CATEGORIES = ["fruits","nuts","berries","dates","gift-boxes","corporate","snacks"];
const BADGES = ["","best-seller","premium","new","limited","sale"];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin.from("products").select("*").order("sort_order").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); }
  function openEdit(p: any) { setEditing(p); setForm({ ...p }); setShowModal(true); }

  function setField(k: string, v: any) { setForm((prev: any) => ({ ...prev, [k]: v })); }

  function slugify(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function save() {
    if (!form.title || !form.price) { toast({ title: "Title and price are required", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...form, slug: form.slug || slugify(form.title), updated_at: new Date().toISOString() };
    delete payload.id; delete payload.created_at;
    let err;
    if (editing) {
      ({ error: err } = await supabaseAdmin.from("products").update(payload).eq("id", editing.id));
    } else {
      ({ error: err } = await supabaseAdmin.from("products").insert(payload));
    }
    if (err) { toast({ title: "Error saving product", description: err.message, variant: "destructive" }); }
    else { toast({ title: editing ? "Product updated" : "Product created" }); setShowModal(false); load(); }
    setSaving(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await supabaseAdmin.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    load();
  }

  async function toggleActive(p: any) {
    await supabaseAdmin.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  }

  const filtered = products.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:brightness-110 transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>{["Product","Category","Price","Stock","Status",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" alt="" /> : <Image size={16} className="m-auto mt-2.5 text-muted-foreground/40" />}
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium">{p.title}</p>
                          <p className="font-body text-xs text-muted-foreground">SKU: {p.sku || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm capitalize">{p.category?.replace("-", " ")}</td>
                    <td className="px-4 py-3 font-body text-sm">
                      <span className="font-semibold">AED {p.price}</span>
                      {p.compare_price && <span className="ml-1 text-muted-foreground line-through text-xs">AED {p.compare_price}</span>}
                    </td>
                    <td className="px-4 py-3 font-body text-sm">{p.in_stock ? <span className="text-green-600">✓ In stock</span> : <span className="text-red-500">Out of stock</span>}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.is_active ? <><Check size={10} /> Active</> : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground font-body text-sm">No products found</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Title *</label>
                  <input value={form.title} onChange={e => { setField("title", e.target.value); if (!editing) setField("slug", slugify(e.target.value)); }} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Price (AED) *</label>
                  <input type="number" value={form.price} onChange={e => setField("price", parseFloat(e.target.value))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Compare Price (AED)</label>
                  <input type="number" value={form.compare_price || ""} onChange={e => setField("compare_price", e.target.value ? parseFloat(e.target.value) : null)} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Optional" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setField("category", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Badge</label>
                  <select value={form.badge || ""} onChange={e => setField("badge", e.target.value || null)} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none">
                    {BADGES.map(b => <option key={b} value={b}>{b || "None"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">SKU</label>
                  <input value={form.sku} onChange={e => setField("sku", e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Stock Quantity</label>
                  <input type="number" value={form.stock_quantity} onChange={e => setField("stock_quantity", parseInt(e.target.value))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Description</label>
                  <textarea value={form.description || ""} onChange={e => setField("description", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm focus:outline-none resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Image URLs (one per line)</label>
                  <textarea value={(form.images || []).join("\n")} onChange={e => setField("images", e.target.value.split("\n").filter(Boolean))} rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm focus:outline-none resize-none" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="font-body text-xs text-muted-foreground mb-1 block">What's Inside (one per line)</label>
                  <textarea value={(form.whats_inside || []).join("\n")} onChange={e => setField("whats_inside", e.target.value.split("\n").filter(Boolean))} rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm focus:outline-none resize-none" placeholder="e.g. Medjool Dates 250g" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="in_stock" checked={form.in_stock} onChange={e => setField("in_stock", e.target.checked)} className="w-4 h-4 rounded" />
                  <label htmlFor="in_stock" className="font-body text-sm">In Stock</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setField("is_active", e.target.checked)} className="w-4 h-4 rounded" />
                  <label htmlFor="is_active" className="font-body text-sm">Active (visible on site)</label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border font-body text-sm hover:bg-muted">Cancel</button>
              <button onClick={save} disabled={saving} className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:brightness-110 disabled:opacity-50">
                {saving ? "Saving…" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

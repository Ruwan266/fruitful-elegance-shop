import { useEffect, useState, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Upload, X, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ITEM_CATEGORIES = ["fruits","nuts","berries","dates","extras","snacks","chocolates"];
const EMPTY_ITEM = { name: "", price: 0, category: "fruits", image_url: "", max_quantity: 3, description: "", is_active: true, sort_order: 0 };

export default function BoxBuilder() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY_ITEM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin.from("box_builder_items").select("*").order("sort_order").order("name");
    setItems(data || []);
    setLoading(false);
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY_ITEM }); setShowModal(true); }
  function openEdit(item: any) { setEditing(item); setForm({ ...item }); setShowModal(true); }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `item_${Date.now()}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("box-items").upload(fileName, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabaseAdmin.storage.from("box-items").getPublicUrl(fileName);
      setForm((p: any) => ({ ...p, image_url: data.publicUrl }));
      toast({ title: "Image uploaded" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setUploading(false);
  }

  async function save() {
    if (!form.name) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    delete payload.id; delete payload.created_at;
    const { error } = editing
      ? await supabaseAdmin.from("box_builder_items").update(payload).eq("id", editing.id)
      : await supabaseAdmin.from("box_builder_items").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Updated" : "Item added" }); setShowModal(false); load(); }
    setSaving(false);
  }

  async function deleteItem(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabaseAdmin.from("box_builder_items").delete().eq("id", id);
    toast({ title: "Deleted" }); load();
  }

  const filtered = filterCat === "all" ? items : items.filter(i => i.category === filterCat);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Box Builder Items</h1>
          <p className="font-body text-sm text-muted-foreground">{items.length} items total</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", ...ITEM_CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all capitalize ${filterCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Package size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No items yet.</p>
          <button onClick={openNew} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm">Add Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className={`bg-card rounded-2xl border border-border overflow-hidden ${!item.is_active ? "opacity-50" : ""}`}>
              <div className="aspect-square bg-muted relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package size={28} className="text-muted-foreground/30" /></div>
                )}
                <span className="absolute top-2 left-2 bg-black/60 text-white font-body text-[10px] px-1.5 py-0.5 rounded-full capitalize">{item.category}</span>
              </div>
              <div className="p-3">
                <h4 className="font-body text-sm font-medium line-clamp-1">{item.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-body text-xs font-semibold text-primary">AED {item.price}</span>
                  <span className="font-body text-[10px] text-muted-foreground">max ×{item.max_quantity}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => openEdit(item)} className="flex-1 py-1 rounded-lg border border-border font-body text-[11px] hover:bg-muted transition-all flex items-center justify-center gap-1"><Pencil size={10} /> Edit</button>
                  <button onClick={() => deleteItem(item.id, item.name)} className="flex-1 py-1 rounded-lg border border-red-200 text-red-500 font-body text-[11px] hover:bg-red-50 transition-all flex items-center justify-center gap-1"><Trash2 size={10} /> Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Item" : "Add Item"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Item Image</label>
                <div onClick={() => fileRef.current?.click()} className="w-full h-40 bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                  {form.image_url ? (
                    <><img src={form.image_url} alt="preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><Upload size={18} className="text-white" /></div></>
                  ) : uploading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="text-center"><Upload size={22} className="text-muted-foreground mx-auto mb-1" /><p className="font-body text-xs text-muted-foreground">Click to upload</p></div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Item Name *</label>
                <input value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} placeholder="e.g. Alphonso Mango"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Price (AED) *</label>
                  <input type="number" value={form.price} min={0} step={0.5} onChange={e => setForm((p: any) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Max Qty Per Box</label>
                  <input type="number" value={form.max_quantity} min={1} max={20} onChange={e => setForm((p: any) => ({ ...p, max_quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} placeholder="Short description (optional)"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm((p: any) => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                <span className="font-body text-sm">Active (visible in builder)</span>
              </label>
            </div>
            <div className="p-5 border-t border-border flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-border font-body text-sm hover:bg-muted transition-all">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all">
                {saving ? "Saving..." : editing ? "Update" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

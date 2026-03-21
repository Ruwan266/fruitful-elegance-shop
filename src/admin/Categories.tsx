import { useEffect, useState, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Upload, X, Check, Image as ImageIcon, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EMPTY = { name: "", slug: "", image_url: "", description: "", sort_order: 0, is_active: true };

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin.from("categories").select("*").order("sort_order").order("name");
    setCategories(data || []);
    setLoading(false);
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); }
  function openEdit(c: any) { setEditing(c); setForm({ ...c }); setShowModal(true); }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("categories")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabaseAdmin.storage.from("categories").getPublicUrl(fileName);
      setForm((p: any) => ({ ...p, image_url: data.publicUrl }));
      toast({ title: "Image uploaded ✓" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setUploading(false);
  }

  async function save() {
    if (!form.name) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      updated_at: new Date().toISOString(),
    };
    delete payload.id; delete payload.created_at;

    const { error } = editing
      ? await supabaseAdmin.from("categories").update(payload).eq("id", editing.id)
      : await supabaseAdmin.from("categories").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editing ? "Category updated ✓" : "Category created ✓" });
      setShowModal(false);
      load();
    }
    setSaving(false);
  }

  async function deleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); load(); }
  }

  async function toggleActive(id: string, current: boolean) {
    await supabaseAdmin.from("categories").update({ is_active: !current }).eq("id", id);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Categories</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <ImageIcon size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No categories yet. Add your first one!</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium">
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className={`bg-card rounded-2xl border overflow-hidden transition-all ${cat.is_active ? "border-border" : "border-border opacity-50"}`}>
              {/* Image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="font-display text-white text-sm font-semibold">{cat.name}</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => toggleActive(cat.id, cat.is_active)}
                    title={cat.is_active ? "Deactivate" : "Activate"}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${cat.is_active ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}
                  >
                    <Check size={12} />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <p className="font-body text-xs text-muted-foreground">/{cat.slug}</p>
                {cat.description && (
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-border font-body text-xs hover:bg-muted transition-all">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => deleteCategory(cat.id, cat.name)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-red-200 text-red-500 font-body text-xs hover:bg-red-50 transition-all">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Category Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-video bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative"
                >
                  {form.image_url ? (
                    <>
                      <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                        <span className="text-white font-body text-xs ml-2">Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        <>
                          <Upload size={24} className="text-muted-foreground mx-auto mb-1" />
                          <p className="font-body text-xs text-muted-foreground">Click to upload image</p>
                          <p className="font-body text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                {form.image_url && (
                  <button onClick={() => setForm((p: any) => ({ ...p, image_url: "" }))} className="mt-1 text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
                    <X size={10} /> Remove image
                  </button>
                )}
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Category Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm((p: any) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="e.g. Premium Nuts"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. premium-nuts"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Sort Order</label>
                  <input
                    type="number" value={form.sort_order}
                    onChange={e => setForm((p: any) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm((p: any) => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                    <span className="font-body text-sm">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-border font-body text-sm hover:bg-muted transition-all">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

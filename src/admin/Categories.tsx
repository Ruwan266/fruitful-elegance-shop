import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Check, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getStore, setStore, fileToBase64, genId, seedDefaults,
  KEYS, type Category,
} from "@/lib/jsonStore";

const EMPTY: Omit<Category, "id"> = {
  name: "", slug: "", description: "", image: "", sort_order: 0, is_active: true,
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, "id">>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    seedDefaults();
    load();
  }, []);

  function load() {
    setCategories(getStore<Category[]>(KEYS.CATEGORIES, []));
  }

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY });
    setShowModal(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description, image: c.image, sort_order: c.sort_order, is_active: c.is_active });
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
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setSaving(true);
    const all = getStore<Category[]>(KEYS.CATEGORIES, []);
    if (editing) {
      const updated = all.map(c => c.id === editing.id ? { ...c, ...form, slug: form.slug || slugify(form.name) } : c);
      setStore(KEYS.CATEGORIES, updated);
    } else {
      const newCat: Category = { id: genId(), ...form, slug: form.slug || slugify(form.name) };
      setStore(KEYS.CATEGORIES, [...all, newCat]);
    }
    toast({ title: editing ? "Category updated ✓" : "Category created ✓" });
    setShowModal(false);
    load();
    setSaving(false);
  }

  function deleteCategory(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    const all = getStore<Category[]>(KEYS.CATEGORIES, []);
    setStore(KEYS.CATEGORIES, all.filter(c => c.id !== id));
    toast({ title: "Deleted" });
    load();
  }

  function toggleActive(id: string) {
    const all = getStore<Category[]>(KEYS.CATEGORIES, []);
    setStore(KEYS.CATEGORIES, all.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Categories</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">{categories.length} categories · stored locally</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <ImageIcon size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No categories yet. Add your first one!</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium">Add Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className={`bg-card rounded-2xl border overflow-hidden transition-all ${cat.is_active ? "border-border" : "border-border opacity-50"}`}>
              {/* Image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <ImageIcon size={28} className="text-muted-foreground/30" />
                    <p className="font-body text-[10px] text-muted-foreground">No image</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <span className="font-display text-white text-sm font-semibold">{cat.name}</span>
                </div>
                <div className="absolute top-2 right-2">
                  <button onClick={() => toggleActive(cat.id)} title={cat.is_active ? "Deactivate" : "Activate"}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${cat.is_active ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                    <Check size={12} />
                  </button>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <p className="font-body text-xs text-muted-foreground">/{cat.slug}</p>
                {cat.description && <p className="font-body text-xs text-muted-foreground line-clamp-2">{cat.description}</p>}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Category Image</label>
                <div onClick={() => fileRef.current?.click()}
                  className="aspect-video bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                  {form.image ? (
                    <>
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                        <span className="text-white font-body text-xs ml-2">Change Image</span>
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
                          <p className="font-body text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP · Stored locally</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                {form.image && (
                  <button onClick={() => setForm(p => ({ ...p, image: "" }))} className="mt-1 text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
                    <X size={10} /> Remove image
                  </button>
                )}
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Category Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="e.g. Premium Nuts"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Slug (URL)</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="e.g. premium-nuts"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description..." rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Sort Order</label>
                  <input type="number" value={form.sort_order}
                    onChange={e => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
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

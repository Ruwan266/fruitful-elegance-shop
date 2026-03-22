import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Upload, X, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getStore, setStore, fileToBase64, genId, seedDefaults,
  KEYS, type BoxItem, type BoxMessage,
} from "@/lib/jsonStore";

const ITEM_CATEGORIES = ["fruits", "nuts", "berries", "dates", "extras", "snacks", "chocolates"];

const EMPTY_ITEM: Omit<BoxItem, "id"> = {
  name: "", price: 0, category: "fruits", image: "", max_quantity: 3,
  description: "", is_active: true, sort_order: 0,
};

export default function BoxBuilder() {
  const [activeTab, setActiveTab] = useState<"items" | "messages">("items");
  const [items, setItems] = useState<BoxItem[]>([]);
  const [messages, setMessages] = useState<BoxMessage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BoxItem | null>(null);
  const [form, setForm] = useState<Omit<BoxItem, "id">>({ ...EMPTY_ITEM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    seedDefaults();
    loadItems();
    loadMessages();
  }, []);

  function loadItems() {
    setItems(getStore<BoxItem[]>(KEYS.BOX_ITEMS, []));
  }

  function loadMessages() {
    setMessages(getStore<BoxMessage[]>(KEYS.BOX_MESSAGES, []));
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY_ITEM }); setShowModal(true); }
  function openEdit(item: BoxItem) { setEditing(item); setForm({ name: item.name, price: item.price, category: item.category, image: item.image, max_quantity: item.max_quantity, description: item.description, is_active: item.is_active, sort_order: item.sort_order }); setShowModal(true); }

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
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    const all = getStore<BoxItem[]>(KEYS.BOX_ITEMS, []);
    if (editing) {
      setStore(KEYS.BOX_ITEMS, all.map(i => i.id === editing.id ? { ...i, ...form } : i));
    } else {
      setStore(KEYS.BOX_ITEMS, [...all, { id: genId(), ...form }]);
    }
    toast({ title: editing ? "Updated ✓" : "Item added ✓" });
    setShowModal(false);
    loadItems();
    setSaving(false);
  }

  function deleteItem(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const all = getStore<BoxItem[]>(KEYS.BOX_ITEMS, []);
    setStore(KEYS.BOX_ITEMS, all.filter(i => i.id !== id));
    toast({ title: "Deleted" });
    loadItems();
  }

  function toggleActive(id: string) {
    const all = getStore<BoxItem[]>(KEYS.BOX_ITEMS, []);
    setStore(KEYS.BOX_ITEMS, all.map(i => i.id === id ? { ...i, is_active: !i.is_active } : i));
    loadItems();
  }

  function markMessageRead(id: string) {
    const all = getStore<BoxMessage[]>(KEYS.BOX_MESSAGES, []);
    setStore(KEYS.BOX_MESSAGES, all.map(m => m.id === id ? { ...m, read: true } : m));
    loadMessages();
  }

  function deleteMessage(id: string) {
    const all = getStore<BoxMessage[]>(KEYS.BOX_MESSAGES, []);
    setStore(KEYS.BOX_MESSAGES, all.filter(m => m.id !== id));
    loadMessages();
  }

  const filtered = filterCat === "all" ? items : items.filter(i => i.category === filterCat);
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Box Builder</h1>
          <p className="font-body text-sm text-muted-foreground">{items.length} items · {messages.length} customer messages</p>
        </div>
        {activeTab === "items" && (
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setActiveTab("items")}
          className={`px-4 py-2.5 font-body text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === "items" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Items ({items.length})
        </button>
        <button onClick={() => setActiveTab("messages")}
          className={`px-4 py-2.5 font-body text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-2 ${activeTab === "messages" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
          Customer Messages
          {unreadCount > 0 && <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
        </button>
      </div>

      {/* Items Tab */}
      {activeTab === "items" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {["all", ...ITEM_CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-full font-body text-xs font-medium transition-all capitalize ${filterCat === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Package size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No items yet.</p>
              <button onClick={openNew} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm">Add Item</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(item => (
                <div key={item.id} className={`bg-card rounded-2xl border border-border overflow-hidden ${!item.is_active ? "opacity-50" : ""}`}>
                  <div className="aspect-square bg-muted relative overflow-hidden cursor-pointer" onClick={() => toggleActive(item.id)}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <Package size={28} className="text-muted-foreground/30" />
                        <span className="font-body text-[10px] text-muted-foreground">No image</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-black/60 text-white font-body text-[10px] px-1.5 py-0.5 rounded-full capitalize">{item.category}</span>
                    <span className={`absolute top-2 right-2 w-4 h-4 rounded-full ${item.is_active ? "bg-green-500" : "bg-gray-400"}`} />
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
        </>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Package size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">No customer messages yet.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`bg-card rounded-2xl border p-5 transition-all ${!msg.read ? "border-primary/30 bg-primary/2" : "border-border"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body text-sm font-semibold">{msg.customer_name || "Guest"}</span>
                      {msg.customer_email && <span className="font-body text-xs text-muted-foreground">{msg.customer_email}</span>}
                      {!msg.read && <span className="bg-primary text-primary-foreground font-body text-[10px] px-2 py-0.5 rounded-full">New</span>}
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{new Date(msg.created_at).toLocaleString()}</p>
                    <p className="font-body text-sm mt-3 text-foreground">{msg.message}</p>
                    {msg.image && (
                      <img src={msg.image} alt="attachment" className="mt-3 h-32 rounded-xl object-cover border border-border" />
                    )}
                    {/* Box details */}
                    <div className="mt-3 bg-muted rounded-xl p-3 font-body text-xs text-muted-foreground space-y-1">
                      <p className="font-semibold text-foreground">Box Details — {msg.box_details.size} · {msg.box_details.color}</p>
                      {msg.box_details.items.map((it, idx) => (
                        <p key={idx}>• {it.name} ×{it.qty} — AED {it.price * it.qty}</p>
                      ))}
                      <p className="font-semibold text-foreground">Total: AED {msg.box_details.total}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!msg.read && (
                      <button onClick={() => markMessageRead(msg.id)} className="text-xs font-body px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all whitespace-nowrap">
                        Mark Read
                      </button>
                    )}
                    <button onClick={() => deleteMessage(msg.id)} className="text-xs font-body px-3 py-1.5 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
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
                <div onClick={() => fileRef.current?.click()}
                  className="w-full h-40 bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative">
                  {form.image ? (
                    <>
                      <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Upload size={18} className="text-white" />
                      </div>
                    </>
                  ) : uploading ? (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="text-center">
                      <Upload size={22} className="text-muted-foreground mx-auto mb-1" />
                      <p className="font-body text-xs text-muted-foreground">Click to upload</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">Stored locally as base64</p>
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

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Item Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Alphonso Mango"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Price (AED) *</label>
                  <input type="number" value={form.price} min={0} step={0.5} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Max Qty Per Box</label>
                  <input type="number" value={form.max_quantity} min={1} max={20} onChange={e => setForm(p => ({ ...p, max_quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description (optional)"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
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

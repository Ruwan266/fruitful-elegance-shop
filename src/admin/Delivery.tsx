import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Truck, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getStore, setStore, genId, seedDefaults,
  KEYS, type DeliveryOption,
} from "@/lib/jsonStore";

const EMOJI_PRESETS = ["🚚", "⚡", "📅", "🏎️", "✈️", "🛵", "📦", "🎁"];

const EMPTY: Omit<DeliveryOption, "id"> = {
  name: "", description: "", price: 0, estimated_time: "",
  icon: "🚚", is_active: true, sort_order: 0,
};

export default function Delivery() {
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DeliveryOption | null>(null);
  const [form, setForm] = useState<Omit<DeliveryOption, "id">>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    seedDefaults();
    load();
  }, []);

  function load() {
    setOptions(getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, []));
  }

  function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true); }
  function openEdit(o: DeliveryOption) {
    setEditing(o);
    setForm({ name: o.name, description: o.description, price: o.price, estimated_time: o.estimated_time, icon: o.icon, is_active: o.is_active, sort_order: o.sort_order });
    setShowModal(true);
  }

  function save() {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    const all = getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, []);
    if (editing) {
      setStore(KEYS.DELIVERY_OPTIONS, all.map(o => o.id === editing.id ? { ...o, ...form } : o));
    } else {
      setStore(KEYS.DELIVERY_OPTIONS, [...all, { id: genId(), ...form }]);
    }
    toast({ title: editing ? "Updated ✓" : "Option added ✓" });
    setShowModal(false);
    load();
    setSaving(false);
  }

  function deleteOption(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const all = getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, []);
    setStore(KEYS.DELIVERY_OPTIONS, all.filter(o => o.id !== id));
    toast({ title: "Deleted" });
    load();
  }

  function toggleActive(id: string) {
    const all = getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, []);
    setStore(KEYS.DELIVERY_OPTIONS, all.map(o => o.id === id ? { ...o, is_active: !o.is_active } : o));
    load();
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const all = getStore<DeliveryOption[]>(KEYS.DELIVERY_OPTIONS, []);
    const updated = [...all];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setStore(KEYS.DELIVERY_OPTIONS, updated.map((o, i) => ({ ...o, sort_order: i })));
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Delivery Options</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            {options.filter(o => o.is_active).length} active options shown at checkout
          </p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all">
          <Plus size={16} /> Add Option
        </button>
      </div>

      {/* Preview note */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
        <Truck size={18} className="text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-body text-sm font-medium text-foreground">These options appear on the checkout page</p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">Customers choose their preferred delivery method before placing an order.</p>
        </div>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Truck size={40} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-body text-sm text-muted-foreground">No delivery options yet.</p>
          <button onClick={openNew} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium">Add Option</button>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={opt.id} className={`bg-card rounded-2xl border p-5 transition-all ${!opt.is_active ? "opacity-50 border-border" : "border-border"}`}>
              <div className="flex items-center gap-4">
                <div className="text-2xl w-10 text-center flex-shrink-0">{opt.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-body text-sm font-semibold">{opt.name}</h3>
                    {opt.price === 0 ? (
                      <span className="bg-green-100 text-green-700 font-body text-[10px] px-2 py-0.5 rounded-full">Free</span>
                    ) : (
                      <span className="bg-secondary text-secondary-foreground font-body text-[10px] px-2 py-0.5 rounded-full">AED {opt.price}</span>
                    )}
                    {!opt.is_active && <span className="bg-muted text-muted-foreground font-body text-[10px] px-2 py-0.5 rounded-full">Hidden</span>}
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                  <p className="font-body text-xs text-primary mt-0.5">⏱ {opt.estimated_time}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {idx > 0 && (
                    <button onClick={() => moveUp(idx)} className="p-1.5 rounded-lg hover:bg-muted transition-all text-muted-foreground" title="Move up">↑</button>
                  )}
                  <button onClick={() => toggleActive(opt.id)} className={`p-1.5 rounded-lg transition-all ${opt.is_active ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}>
                    {opt.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => openEdit(opt)} className="p-1.5 rounded-lg hover:bg-muted transition-all"><Pencil size={14} /></button>
                  <button onClick={() => deleteOption(opt.id, opt.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Delivery Option" : "Add Delivery Option"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-muted rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_PRESETS.map(e => (
                    <button key={e} onClick={() => setForm(p => ({ ...p, icon: e }))}
                      className={`w-10 h-10 rounded-xl border-2 text-xl flex items-center justify-center transition-all ${form.icon === e ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
                      {e}
                    </button>
                  ))}
                  <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-border bg-background text-center font-body text-xl focus:outline-none focus:ring-2 focus:ring-primary/20" maxLength={2} />
                </div>
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Same-Day Delivery"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div>
                <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Order before 2 PM for today"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Price (AED)</label>
                  <input type="number" value={form.price} min={0} step={5} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">Set 0 for free</p>
                </div>
                <div>
                  <label className="font-body text-xs font-medium text-muted-foreground block mb-1.5">Estimated Time</label>
                  <input value={form.estimated_time} onChange={e => setForm(p => ({ ...p, estimated_time: e.target.value }))} placeholder="e.g. 2-4 hours"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
                <span className="font-body text-sm">Active (visible at checkout)</span>
              </label>
            </div>
            <div className="p-5 border-t border-border flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-xl border border-border font-body text-sm hover:bg-muted transition-all">Cancel</button>
              <button onClick={save} disabled={saving} className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-body text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Add Option"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

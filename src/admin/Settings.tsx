import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [zones, setZones] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [zoneForm, setZoneForm] = useState<any>({ name: "", emirates: [], price: 0, free_above: 200, estimated_hours: "2-4 hours" });
  const [discountForm, setDiscountForm] = useState<any>({ code: "", type: "percentage", value: 10, min_order: 0, is_active: true });
  const { toast } = useToast();

  const UAE_EMIRATES = ["Dubai","Abu Dhabi","Sharjah","Ajman","Fujairah","Ras Al Khaimah","Umm Al Quwain"];

  useEffect(() => { loadZones(); loadDiscounts(); }, []);
  async function loadZones() {
    const { data } = await supabaseAdmin.from("delivery_zones").select("*").order("name");
    setZones(data || []);
  }
  async function loadDiscounts() {
    const { data } = await supabaseAdmin.from("discount_codes").select("*").order("created_at", { ascending: false });
    setDiscounts(data || []);
  }

  async function saveZone() {
    const payload = { ...zoneForm }; delete payload.id; delete payload.created_at;
    const { error } = editingZone
      ? await supabaseAdmin.from("delivery_zones").update(payload).eq("id", editingZone.id)
      : await supabaseAdmin.from("delivery_zones").insert(payload);
    if (!error) { toast({ title: "Zone saved" }); setShowZoneModal(false); loadZones(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  }

  async function saveDiscount() {
    const payload = { ...discountForm, code: discountForm.code.toUpperCase() }; delete payload.id; delete payload.created_at;
    const { error } = editingDiscount
      ? await supabaseAdmin.from("discount_codes").update(payload).eq("id", editingDiscount.id)
      : await supabaseAdmin.from("discount_codes").insert(payload);
    if (!error) { toast({ title: "Discount saved" }); setShowDiscountModal(false); loadDiscounts(); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  }

  async function delZone(id: string) { if (confirm("Delete zone?")) { await supabaseAdmin.from("delivery_zones").delete().eq("id", id); loadZones(); } }
  async function delDiscount(id: string) { if (confirm("Delete discount?")) { await supabaseAdmin.from("discount_codes").delete().eq("id", id); loadDiscounts(); } }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>

      {/* Delivery Zones */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-body text-sm font-semibold">🚚 Delivery Zones</h3>
            <p className="font-body text-xs text-muted-foreground mt-0.5">Configure shipping rates per emirate</p>
          </div>
          <button onClick={() => { setEditingZone(null); setZoneForm({ name: "", emirates: [], price: 0, free_above: 200, estimated_hours: "2-4 hours" }); setShowZoneModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-body text-xs font-semibold">
            <Plus size={13} /> Add Zone
          </button>
        </div>
        <div className="divide-y divide-border">
          {zones.map(z => (
            <div key={z.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-body text-sm font-medium">{z.name}</p>
                <p className="font-body text-xs text-muted-foreground">{(z.emirates || []).join(", ")} · {z.estimated_hours}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-body text-sm font-semibold">{z.price === 0 ? "Free" : `AED ${z.price}`}</p>
                  <p className="font-body text-xs text-muted-foreground">Free above AED {z.free_above}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingZone(z); setZoneForm(z); setShowZoneModal(true); }} className="p-1.5 rounded-lg hover:bg-muted"><Pencil size={13} /></button>
                  <button onClick={() => delZone(z.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Codes */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-body text-sm font-semibold">🎟️ Discount Codes</h3>
            <p className="font-body text-xs text-muted-foreground mt-0.5">Create and manage promo codes</p>
          </div>
          <button onClick={() => { setEditingDiscount(null); setDiscountForm({ code: "", type: "percentage", value: 10, min_order: 0, is_active: true }); setShowDiscountModal(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-body text-xs font-semibold">
            <Plus size={13} /> Add Code
          </button>
        </div>
        <div className="divide-y divide-border">
          {discounts.length === 0 && <p className="p-5 font-body text-sm text-muted-foreground text-center">No discount codes yet</p>}
          {discounts.map(d => (
            <div key={d.id} className="p-4 flex items-center justify-between">
              <div>
                <code className="font-mono text-sm font-bold bg-muted px-2 py-0.5 rounded">{d.code}</code>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  {d.type === "percentage" ? `${d.value}% off` : `AED ${d.value} off`} · Min order AED {d.min_order}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${d.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {d.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingDiscount(d); setDiscountForm(d); setShowDiscountModal(true); }} className="p-1.5 rounded-lg hover:bg-muted"><Pencil size={13} /></button>
                  <button onClick={() => delDiscount(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowZoneModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-body text-base font-semibold">{editingZone ? "Edit Zone" : "Add Zone"}</h2>
              <button onClick={() => setShowZoneModal(false)}><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="font-body text-xs text-muted-foreground mb-1 block">Zone Name</label>
                <input value={zoneForm.name} onChange={e => setZoneForm((p: any) => ({...p, name: e.target.value}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" /></div>
              <div><label className="font-body text-xs text-muted-foreground mb-2 block">Emirates</label>
                <div className="grid grid-cols-2 gap-2">
                  {UAE_EMIRATES.map(e => (
                    <label key={e} className="flex items-center gap-2 font-body text-sm">
                      <input type="checkbox" checked={(zoneForm.emirates || []).includes(e)} onChange={ev => setZoneForm((p: any) => ({ ...p, emirates: ev.target.checked ? [...(p.emirates||[]), e] : (p.emirates||[]).filter((x: string) => x !== e) }))} className="w-4 h-4 rounded" /> {e}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="font-body text-xs text-muted-foreground mb-1 block">Price (AED)</label>
                  <input type="number" value={zoneForm.price} onChange={e => setZoneForm((p: any) => ({...p, price: parseFloat(e.target.value)}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" /></div>
                <div><label className="font-body text-xs text-muted-foreground mb-1 block">Free above (AED)</label>
                  <input type="number" value={zoneForm.free_above} onChange={e => setZoneForm((p: any) => ({...p, free_above: parseFloat(e.target.value)}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" /></div>
              </div>
              <div><label className="font-body text-xs text-muted-foreground mb-1 block">Delivery Time</label>
                <input value={zoneForm.estimated_hours} onChange={e => setZoneForm((p: any) => ({...p, estimated_hours: e.target.value}))} placeholder="e.g. 2-4 hours" className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" /></div>
            </div>
            <div className="p-5 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowZoneModal(false)} className="px-4 py-2 rounded-xl border border-border font-body text-sm">Cancel</button>
              <button onClick={saveZone} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold">Save Zone</button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDiscountModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-body text-base font-semibold">{editingDiscount ? "Edit Code" : "Add Code"}</h2>
              <button onClick={() => setShowDiscountModal(false)}><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="font-body text-xs text-muted-foreground mb-1 block">Code</label>
                <input value={discountForm.code} onChange={e => setDiscountForm((p: any) => ({...p, code: e.target.value.toUpperCase()}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-mono text-sm uppercase focus:outline-none" placeholder="SAVE10" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="font-body text-xs text-muted-foreground mb-1 block">Type</label>
                  <select value={discountForm.type} onChange={e => setDiscountForm((p: any) => ({...p, type: e.target.value}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none">
                    <option value="percentage">Percentage</option><option value="fixed">Fixed AED</option>
                  </select></div>
                <div><label className="font-body text-xs text-muted-foreground mb-1 block">Value</label>
                  <input type="number" value={discountForm.value} onChange={e => setDiscountForm((p: any) => ({...p, value: parseFloat(e.target.value)}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" /></div>
              </div>
              <div><label className="font-body text-xs text-muted-foreground mb-1 block">Min Order (AED)</label>
                <input type="number" value={discountForm.min_order} onChange={e => setDiscountForm((p: any) => ({...p, min_order: parseFloat(e.target.value)}))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" /></div>
              <label className="flex items-center gap-2 font-body text-sm">
                <input type="checkbox" checked={discountForm.is_active} onChange={e => setDiscountForm((p: any) => ({...p, is_active: e.target.checked}))} className="w-4 h-4 rounded" /> Active
              </label>
            </div>
            <div className="p-5 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowDiscountModal(false)} className="px-4 py-2 rounded-xl border border-border font-body text-sm">Cancel</button>
              <button onClick={saveDiscount} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

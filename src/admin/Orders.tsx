import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Search, Eye, X, Truck, CheckCircle, XCircle, Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending","confirmed","processing","out_for_delivery","delivered","cancelled","refunded"];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewing, setViewing] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdatingStatus(true);
    const { error } = await supabaseAdmin.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else {
      toast({ title: "Order status updated" });
      if (viewing) setViewing({ ...viewing, status });
      load();
    }
    setUpdatingStatus(false);
  }

  async function updateNotes(orderId: string, notes: string) {
    await supabaseAdmin.from("orders").update({ admin_notes: notes }).eq("id", orderId);
    toast({ title: "Notes saved" });
  }

  const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: "bg-amber-100 text-amber-700", icon: Clock },
    confirmed: { color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    processing: { color: "bg-purple-100 text-purple-700", icon: Package },
    out_for_delivery: { color: "bg-cyan-100 text-cyan-700", icon: Truck },
    delivered: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    cancelled: { color: "bg-red-100 text-red-700", icon: XCircle },
    refunded: { color: "bg-gray-100 text-gray-700", icon: XCircle },
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customer_email?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || String(o.order_number).includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Orders</h1>
        <span className="font-body text-sm text-muted-foreground">{filtered.length} orders</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, order #…" className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-10 px-3 rounded-xl border border-border bg-card font-body text-sm focus:outline-none">
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>{["Order #","Customer","Date","Total","Payment","Status",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(o => {
                  const sc = statusConfig[o.status];
                  const StatusIcon = sc?.icon || Clock;
                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-body text-sm font-semibold">#{o.order_number}</td>
                      <td className="px-4 py-3">
                        <p className="font-body text-sm">{o.customer_name || "Guest"}</p>
                        <p className="font-body text-xs text-muted-foreground">{o.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 font-body text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="px-4 py-3 font-body text-sm font-semibold">AED {(o.total || 0).toFixed(0)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${o.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${sc?.color || "bg-gray-100 text-gray-600"}`}>
                          <StatusIcon size={10} /> {o.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewing(o)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-muted-foreground font-body text-sm">No orders found</div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Order #{viewing.order_number}</h2>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="font-body text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-body text-sm font-medium">{viewing.customer_name || "Guest"}</p>
                  <p className="font-body text-xs text-muted-foreground">{viewing.customer_email}</p>
                  {viewing.customer_phone && <p className="font-body text-xs">{viewing.customer_phone}</p>}
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="font-body text-xs text-muted-foreground mb-1">Delivery</p>
                  {viewing.shipping_address && <p className="font-body text-xs">{JSON.stringify(viewing.shipping_address)}</p>}
                  {viewing.delivery_date && <p className="font-body text-xs">Date: {viewing.delivery_date}</p>}
                  {viewing.delivery_slot && <p className="font-body text-xs">Slot: {viewing.delivery_slot}</p>}
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="font-body text-xs text-muted-foreground">Subtotal</p>
                  <p className="font-body text-sm font-semibold">AED {(viewing.subtotal || 0).toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="font-body text-xs text-muted-foreground">Shipping</p>
                  <p className="font-body text-sm font-semibold">AED {(viewing.shipping_cost || 0).toFixed(0)}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 text-center">
                  <p className="font-body text-xs text-muted-foreground">Total</p>
                  <p className="font-body text-sm font-bold text-primary">AED {(viewing.total || 0).toFixed(0)}</p>
                </div>
              </div>

              {/* Special notes */}
              {(viewing.gift_note || viewing.packaging_instructions || viewing.occasion) && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                  {viewing.occasion && <p className="font-body text-xs"><span className="font-medium">Occasion:</span> {viewing.occasion}</p>}
                  {viewing.packaging_instructions && <p className="font-body text-xs"><span className="font-medium">Packaging:</span> {viewing.packaging_instructions}</p>}
                  {viewing.gift_note && <p className="font-body text-xs"><span className="font-medium">Gift note:</span> {viewing.gift_note}</p>}
                </div>
              )}

              {/* Update Status */}
              <div>
                <label className="font-body text-xs text-muted-foreground mb-2 block">Update Order Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(viewing.id, s)} disabled={updatingStatus || viewing.status === s} className={`px-3 py-1.5 rounded-lg font-body text-xs font-medium transition-all ${viewing.status === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-primary/10"}`}>
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Admin Notes</label>
                <textarea defaultValue={viewing.admin_notes || ""} onBlur={e => updateNotes(viewing.id, e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm focus:outline-none resize-none" placeholder="Internal notes (not visible to customer)…" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Search, Eye, X, Users } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }

  async function viewCustomer(c: any) {
    setViewing(c);
    const { data } = await supabaseAdmin.from("orders").select("*").eq("customer_email", c.email).order("created_at", { ascending: false });
    setOrders(data || []);
  }

  const filtered = customers.filter(c =>
    !search || c.email?.toLowerCase().includes(search.toLowerCase()) ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Customers</h1>
        <span className="font-body text-sm text-muted-foreground">{customers.length} total</span>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…" className="w-full pl-9 pr-4 h-10 rounded-xl border border-border bg-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-body text-sm text-muted-foreground">No customers yet</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Customers appear here when they register or place orders</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>{["Customer","Email","Phone","Joined",""].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-body text-xs font-semibold text-primary">
                          {(c.first_name?.[0] || c.email?.[0] || "?").toUpperCase()}
                        </div>
                        <span className="font-body text-sm">{c.first_name} {c.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 font-body text-sm text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-4 py-3 font-body text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewCustomer(c)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{viewing.first_name} {viewing.last_name}</h2>
              <button onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="font-body text-xs text-muted-foreground">Email</p><p className="font-body">{viewing.email}</p></div>
                <div><p className="font-body text-xs text-muted-foreground">Phone</p><p className="font-body">{viewing.phone || "—"}</p></div>
                <div><p className="font-body text-xs text-muted-foreground">Joined</p><p className="font-body">{new Date(viewing.created_at).toLocaleDateString()}</p></div>
                <div><p className="font-body text-xs text-muted-foreground">Orders</p><p className="font-body font-semibold">{orders.length}</p></div>
              </div>
              <div>
                <h3 className="font-body text-sm font-semibold mb-3">Order History</h3>
                {orders.length === 0 ? (
                  <p className="font-body text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                        <div>
                          <p className="font-body text-sm font-medium">#{o.order_number}</p>
                          <p className="font-body text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-body text-sm font-semibold">AED {(o.total || 0).toFixed(0)}</p>
                          <span className="font-body text-[11px] text-muted-foreground">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

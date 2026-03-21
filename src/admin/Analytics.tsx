import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend,
} from "recharts";
import { Download, TrendingUp, Users, DollarSign, ShoppingBag, Award } from "lucide-react";

function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function Analytics() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"7"|"30"|"90"|"365">("30");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [ordRes, custRes] = await Promise.all([
      supabaseAdmin.from("orders").select("*").order("created_at"),
      supabaseAdmin.from("customers").select("*").order("created_at"),
    ]);
    setOrders(ordRes.data || []);
    setCustomers(custRes.data || []);
    setLoading(false);
  }

  const days = parseInt(range);
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  const rangeOrders = orders.filter(o => new Date(o.created_at) >= cutoff);
  const totalRevenue = rangeOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalProfit  = rangeOrders.reduce((s, o) => s + (o.profit || (o.total || 0) * 0.35), 0);
  const avgOrder     = rangeOrders.length ? totalRevenue / rangeOrders.length : 0;

  const dailyData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (Math.min(days,30) - 1 - i));
    const key = d.toISOString().split("T")[0];
    const dayOrders = orders.filter(o => o.created_at?.startsWith(key));
    return {
      date: d.toLocaleDateString("en-AE", { month: "short", day: "numeric" }),
      revenue: Math.round(dayOrders.reduce((s, o) => s + (o.total || 0), 0)),
      profit: Math.round(dayOrders.reduce((s, o) => s + (o.profit || (o.total || 0) * 0.35), 0)),
      orders: dayOrders.length,
    };
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (11 - i));
    const y = d.getFullYear(); const m = d.getMonth();
    const mo = orders.filter(o => { const od = new Date(o.created_at); return od.getFullYear() === y && od.getMonth() === m; });
    return {
      month: MONTH_NAMES[m],
      revenue: Math.round(mo.reduce((s, o) => s + (o.total || 0), 0)),
      profit: Math.round(mo.reduce((s, o) => s + (o.profit || (o.total || 0) * 0.35), 0)),
      orders: mo.length,
      customers: customers.filter(c => { const cd = new Date(c.created_at); return cd.getFullYear() === y && cd.getMonth() === m; }).length,
    };
  });

  const custMonthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const y = d.getFullYear(); const m = d.getMonth();
    return { month: MONTH_NAMES[m], new: customers.filter(c => { const cd = new Date(c.created_at); return cd.getFullYear() === y && cd.getMonth() === m; }).length };
  });

  const statusPie = ["pending","confirmed","processing","delivered","cancelled"].map(s => ({ name: s, value: rangeOrders.filter(o => o.status === s).length })).filter(s => s.value > 0);
  const COLORS = ["#f59e0b","#3b82f6","#8b5cf6","#22c55e","#ef4444"];

  const exportOrders = orders.map(o => ({ order_number: o.order_number, date: new Date(o.created_at).toLocaleDateString(), customer: o.customer_name||o.customer_email, status: o.status, total: o.total, profit: o.profit || Math.round((o.total||0)*0.35), payment: o.payment_method }));
  const exportCustomers = customers.map(c => ({ email: c.email, name: `${c.first_name||""} ${c.last_name||""}`.trim(), phone: c.phone||"", total_orders: c.total_orders, total_spent: c.total_spent, vip: c.is_vip?"Yes":"No", joined: new Date(c.created_at).toLocaleDateString() }));
  const exportMonthly = monthlyData.map(m => ({ month: m.month, orders: m.orders, revenue: m.revenue, profit: m.profit, new_customers: m.customers }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Analytics & Reports</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            {(["7","30","90","365"] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1 rounded-lg font-body text-xs font-medium transition-all ${range===r?"bg-card shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
                {r==="365"?"1Y":`${r}D`}
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setShowExport(!showExport)} className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-xl font-body text-xs font-medium hover:brightness-110 transition-all">
              <Download size={13} /> Export
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg p-1.5 z-10 w-48">
                <button onClick={() => { exportToCSV(exportOrders,"orders"); setShowExport(false); }} className="w-full text-left px-3 py-2 font-body text-xs hover:bg-muted rounded-lg transition-all">📦 Orders CSV</button>
                <button onClick={() => { exportToCSV(exportCustomers,"customers"); setShowExport(false); }} className="w-full text-left px-3 py-2 font-body text-xs hover:bg-muted rounded-lg transition-all">👥 Customers CSV</button>
                <button onClick={() => { exportToCSV(exportMonthly,"monthly_report"); setShowExport(false); }} className="w-full text-left px-3 py-2 font-body text-xs hover:bg-muted rounded-lg transition-all">📊 Monthly Report CSV</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Total Revenue", value:`AED ${totalRevenue.toLocaleString()}`, icon:DollarSign, color:"text-green-600", bg:"bg-green-50", sub:`${rangeOrders.length} orders` },
          { label:"Total Profit", value:`AED ${Math.round(totalProfit).toLocaleString()}`, icon:TrendingUp, color:"text-blue-600", bg:"bg-blue-50", sub:`${totalRevenue>0?Math.round((totalProfit/totalRevenue)*100):0}% margin` },
          { label:"Avg Order Value", value:`AED ${Math.round(avgOrder)}`, icon:ShoppingBag, color:"text-purple-600", bg:"bg-purple-50", sub:"per order" },
          { label:"Registered Customers", value:customers.length.toLocaleString(), icon:Users, color:"text-orange-600", bg:"bg-orange-50", sub:`${custMonthly[custMonthly.length-1]?.new||0} this month` },
        ].map((c,i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-body text-xs text-muted-foreground">{c.label}</span>
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}><c.icon size={16} className={c.color} /></div>
            </div>
            <p className="font-display text-xl font-bold">{c.value}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-body text-sm font-semibold mb-4">Revenue vs Profit — Last {Math.min(days,30)} Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.15}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient>
              <linearGradient id="prof" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize:10 }} interval={Math.floor(dailyData.length/6)} />
            <YAxis tick={{ fontSize:11 }} />
            <Tooltip formatter={(v, name) => [`AED ${v}`, name==="revenue"?"Revenue":"Profit"]} />
            <Legend />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" fill="url(#rev)" strokeWidth={2} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#3b82f6" fill="url(#prof)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-body text-sm font-semibold mb-4">Monthly Performance — Last 12 Months</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize:11 }} />
            <YAxis tick={{ fontSize:11 }} />
            <Tooltip formatter={(v, name) => [`AED ${v}`, name==="revenue"?"Revenue":"Profit"]} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[4,4,0,0]} />
            <Bar dataKey="profit" name="Profit" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-body text-sm font-semibold mb-4">Order Status Breakdown</h3>
          {statusPie.length===0 ? <p className="font-body text-sm text-muted-foreground text-center py-8">No data for this period</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusPie.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-body text-sm font-semibold mb-4">New Customer Registrations — 6 Months</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={custMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="new" name="New Customers" stroke="#f59e0b" strokeWidth={2} dot={{ r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-body text-sm font-semibold">Top Customers by Spend</h3>
          <button onClick={() => exportToCSV(exportCustomers,"customers")} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg font-body text-xs hover:bg-muted transition-all"><Download size={12}/> Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50"><tr>{["Customer","Email","Orders","Total Spent","VIP"].map(h => <th key={h} className="px-4 py-3 text-left font-body text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {[...customers].sort((a,b) => (b.total_spent||0)-(a.total_spent||0)).slice(0,10).map(c => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-body text-sm font-medium">{c.first_name} {c.last_name}</td>
                  <td className="px-4 py-3 font-body text-sm text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 font-body text-sm">{c.total_orders||0}</td>
                  <td className="px-4 py-3 font-body text-sm font-semibold">AED {(c.total_spent||0).toLocaleString()}</td>
                  <td className="px-4 py-3">{c.is_vip ? <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"><Award size={10}/> VIP</span> : <span className="text-[11px] text-muted-foreground">—</span>}</td>
                </tr>
              ))}
              {customers.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center font-body text-sm text-muted-foreground">No customers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

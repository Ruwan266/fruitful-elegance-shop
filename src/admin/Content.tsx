import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Content() {
  const [hero, setHero] = useState({ title: "", subtitle: "", badge: "" });
  const [announcement, setAnnouncement] = useState({ text: "" });
  const [storeInfo, setStoreInfo] = useState({ name: "", email: "", phone: "", instagram: "", whatsapp: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabaseAdmin.from("site_content").select("*");
    if (data) {
      data.forEach((row: any) => {
        if (row.key === "hero") setHero(row.value);
        if (row.key === "announcement") setAnnouncement(row.value);
        if (row.key === "store_info") setStoreInfo(row.value);
      });
    }
    setLoading(false);
  }

  async function saveContent(key: string, value: any) {
    setSaving(key);
    const { error } = await supabaseAdmin.from("site_content").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) { toast({ title: "Error saving", description: error.message, variant: "destructive" }); }
    else { toast({ title: `${key} saved successfully` }); }
    setSaving(null);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Content Manager</h1>
        <button onClick={load} className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground"><RefreshCw size={13} /> Reload</button>
      </div>

      {/* Announcement Bar */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <h3 className="font-body text-sm font-semibold">📢 Announcement Bar</h3>
        <p className="font-body text-xs text-muted-foreground">Shown at the very top of every page</p>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">Announcement Text</label>
          <input value={announcement.text} onChange={e => setAnnouncement({ text: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" />
        </div>
        <button onClick={() => saveContent("announcement", announcement)} disabled={saving === "announcement"} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:brightness-110 disabled:opacity-50">
          <Save size={14} /> {saving === "announcement" ? "Saving…" : "Save Announcement"}
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <h3 className="font-body text-sm font-semibold">🏠 Homepage Hero</h3>
        <p className="font-body text-xs text-muted-foreground">The main headline section on your homepage</p>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">Hero Badge (small text above headline)</label>
          <input value={hero.badge} onChange={e => setHero(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Premium UAE Gift Delivery" className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">Main Title</label>
          <input value={hero.title} onChange={e => setHero(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">Subtitle</label>
          <textarea value={hero.subtitle} onChange={e => setHero(p => ({ ...p, subtitle: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background font-body text-sm focus:outline-none resize-none" />
        </div>
        <button onClick={() => saveContent("hero", hero)} disabled={saving === "hero"} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:brightness-110 disabled:opacity-50">
          <Save size={14} /> {saving === "hero" ? "Saving…" : "Save Hero"}
        </button>
      </div>

      {/* Store Info */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <h3 className="font-body text-sm font-semibold">🏪 Store Information</h3>
        <p className="font-body text-xs text-muted-foreground">Used in footer, contact page, emails</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "name", label: "Store Name" },
            { key: "email", label: "Contact Email" },
            { key: "phone", label: "Phone Number" },
            { key: "instagram", label: "Instagram Handle" },
            { key: "whatsapp", label: "WhatsApp Number" },
          ].map(f => (
            <div key={f.key} className={f.key === "name" ? "col-span-2" : ""}>
              <label className="font-body text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={(storeInfo as any)[f.key] || ""} onChange={e => setStoreInfo(p => ({ ...p, [f.key]: e.target.value }))} className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none" />
            </div>
          ))}
        </div>
        <button onClick={() => saveContent("store_info", storeInfo)} disabled={saving === "store_info"} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-body text-sm font-semibold hover:brightness-110 disabled:opacity-50">
          <Save size={14} /> {saving === "store_info" ? "Saving…" : "Save Store Info"}
        </button>
      </div>
    </div>
  );
}

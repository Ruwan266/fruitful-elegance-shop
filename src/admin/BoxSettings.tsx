import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Package, Palette, Ribbon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabaseAdmin } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BoxSize {
  id: string;
  label: string;
  description: string;
  max_items: number;
  base_price: number;
  sort_order: number;
}

interface BoxColor {
  id: string;
  name: string;
  sort_order: number;
}

interface BoxRibbon {
  id: string;
  label: string;
  value: string;
  price: number;
  sort_order: number;
}

// ─── Default fallbacks (used if DB tables not yet created) ────────────────────

const DEFAULT_SIZES: BoxSize[] = [
  { id: "s1", label: "S", description: "Up to 4 items", max_items: 4, base_price: 15, sort_order: 1 },
  { id: "s2", label: "M", description: "Up to 6 items", max_items: 6, base_price: 25, sort_order: 2 },
  { id: "s3", label: "L", description: "Up to 10 items", max_items: 10, base_price: 35, sort_order: 3 },
];

const DEFAULT_COLORS: BoxColor[] = [
  { id: "c1", name: "Forest Green", sort_order: 1 },
  { id: "c2", name: "Gold",         sort_order: 2 },
  { id: "c3", name: "Cream",        sort_order: 3 },
  { id: "c4", name: "Berry Red",    sort_order: 4 },
];

const DEFAULT_RIBBONS: BoxRibbon[] = [
  { id: "r1", label: "Classic Gold",  value: "classic-gold",  price: 0, sort_order: 1 },
  { id: "r2", label: "Satin Red",     value: "satin-red",     price: 5, sort_order: 2 },
  { id: "r3", label: "Forest Green",  value: "forest-green",  price: 5, sort_order: 3 },
  { id: "r4", label: "Pearl White",   value: "pearl-white",   price: 8, sort_order: 4 },
  { id: "r5", label: "Royal Purple",  value: "royal-purple",  price: 8, sort_order: 5 },
];

// ─── Supabase helpers (graceful fallback to defaults if tables missing) ────────

async function loadFromDb<T>(table: string, fallback: T[]): Promise<T[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .order("sort_order");
    if (error || !data || data.length === 0) return fallback;
    return data as T[];
  } catch {
    return fallback;
  }
}

async function saveToDb<T extends { id: string }>(table: string, rows: T[]): Promise<boolean> {
  try {
    await supabaseAdmin.from(table).delete().neq("id", "____never____");
    const { error } = await supabaseAdmin.from(table).insert(rows);
    return !error;
  } catch {
    return false;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BoxSettings() {
  const [tab, setTab] = useState<"sizes" | "colors" | "ribbons">("sizes");

  const [sizes,   setSizes]   = useState<BoxSize[]>(DEFAULT_SIZES);
  const [colors,  setColors]  = useState<BoxColor[]>(DEFAULT_COLORS);
  const [ribbons, setRibbons] = useState<BoxRibbon[]>(DEFAULT_RIBBONS);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setSizes(await  loadFromDb("app_box_sizes",   DEFAULT_SIZES));
      setColors(await loadFromDb("app_box_colors",  DEFAULT_COLORS));
      setRibbons(await loadFromDb("app_box_ribbons", DEFAULT_RIBBONS));
      setLoading(false);
    })();
  }, []);

  // ── Size helpers ────────────────────────────────────────────────────────────

  function addSize() {
    setSizes(prev => [...prev, {
      id: `s${Date.now()}`, label: "", description: "", max_items: 5, base_price: 0,
      sort_order: prev.length + 1,
    }]);
  }

  function updateSize(id: string, field: keyof BoxSize, value: any) {
    setSizes(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  function removeSize(id: string) {
    setSizes(prev => prev.filter(s => s.id !== id));
  }

  // ── Color helpers ───────────────────────────────────────────────────────────

  function addColor() {
    setColors(prev => [...prev, { id: `c${Date.now()}`, name: "", sort_order: prev.length + 1 }]);
  }

  function updateColor(id: string, name: string) {
    setColors(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }

  function removeColor(id: string) {
    setColors(prev => prev.filter(c => c.id !== id));
  }

  // ── Ribbon helpers ──────────────────────────────────────────────────────────

  function addRibbon() {
    const label = "New Ribbon";
    setRibbons(prev => [...prev, {
      id: `r${Date.now()}`, label, value: label.toLowerCase().replace(/\s+/g, "-"),
      price: 0, sort_order: prev.length + 1,
    }]);
  }

  function updateRibbon(id: string, field: keyof BoxRibbon, value: any) {
    setRibbons(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function removeRibbon(id: string) {
    setRibbons(prev => prev.filter(r => r.id !== id));
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function saveAll() {
    setSaving(true);
    const [ok1, ok2, ok3] = await Promise.all([
      saveToDb("app_box_sizes",   sizes),
      saveToDb("app_box_colors",  colors),
      saveToDb("app_box_ribbons", ribbons),
    ]);

    if (ok1 && ok2 && ok3) {
      toast({ title: "Box settings saved ✓", description: "Changes are live on the website." });
    } else {
      // Fallback: save to localStorage so frontend can still read it
      localStorage.setItem("ff_box_sizes",   JSON.stringify(sizes));
      localStorage.setItem("ff_box_colors",  JSON.stringify(colors));
      localStorage.setItem("ff_box_ribbons", JSON.stringify(ribbons));
      toast({
        title: "Saved locally ✓",
        description: "Run the SQL below in Supabase to enable shared saving.",
      });
    }
    setSaving(false);
  }

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Box Builder Settings</h1>
          <p className="font-body text-sm text-muted-foreground mt-0.5">
            Manage sizes, colours, and ribbons shown on the Build Your Box page
          </p>
        </div>
        <button onClick={saveAll} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-body text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50">
          <Save size={16} />
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {(["sizes", "colors", "ribbons"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-body text-sm font-medium transition-all capitalize ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "sizes" ? "📦 Sizes" : t === "colors" ? "🎨 Colors" : "🎀 Ribbons"}
          </button>
        ))}
      </div>

      {/* ── SIZES ── */}
      {tab === "sizes" && (
        <div className="space-y-4">
          <p className="font-body text-xs text-muted-foreground">Each size defines how many items fit and the base price added to the box total.</p>

          {sizes.map((size, idx) => (
            <div key={size.id} className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Size {idx + 1}</span>
                <button onClick={() => removeSize(size.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1">Label *</label>
                  <input value={size.label} onChange={e => updateSize(size.id, "label", e.target.value)}
                    placeholder="e.g. S" maxLength={5}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1">Description</label>
                  <input value={size.description} onChange={e => updateSize(size.id, "description", e.target.value)}
                    placeholder="e.g. Up to 4 items"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1">Max Items</label>
                  <input type="number" value={size.max_items} min={1} max={50}
                    onChange={e => updateSize(size.id, "max_items", parseInt(e.target.value) || 1)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1">Base Price (AED)</label>
                  <input type="number" value={size.base_price} min={0} step={5}
                    onChange={e => updateSize(size.id, "base_price", parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              {/* Preview */}
              <div className="bg-muted rounded-xl px-4 py-2 font-body text-xs text-muted-foreground">
                Preview: <span className="font-semibold text-foreground">{size.label || "?"}</span> · {size.description || "—"} · +AED {size.base_price} · max {size.max_items} items
              </div>
            </div>
          ))}

          <button onClick={addSize} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
            <Plus size={16} /> Add Size
          </button>
        </div>
      )}

      {/* ── COLORS ── */}
      {tab === "colors" && (
        <div className="space-y-4">
          <p className="font-body text-xs text-muted-foreground">Box wrapping colours available for customers to choose from.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colors.map(color => (
              <div key={color.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 font-body text-sm">🎨</div>
                <input value={color.name} onChange={e => updateColor(color.id, e.target.value)}
                  placeholder="e.g. Rose Gold"
                  className="flex-1 h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <button onClick={() => removeColor(color.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={addColor} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
            <Plus size={16} /> Add Color
          </button>

          {/* Preview */}
          <div className="bg-muted rounded-2xl p-4">
            <p className="font-body text-xs text-muted-foreground mb-3">Customer preview:</p>
            <div className="flex flex-wrap gap-2">
              {colors.filter(c => c.name).map(color => (
                <span key={color.id} className="px-4 py-2 rounded-full bg-card border border-border font-body text-xs font-medium">{color.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RIBBONS ── */}
      {tab === "ribbons" && (
        <div className="space-y-4">
          <p className="font-body text-xs text-muted-foreground">Ribbon options with optional add-on prices.</p>

          {ribbons.map((ribbon, idx) => (
            <div key={ribbon.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ribbon {idx + 1}</span>
                <button onClick={() => removeRibbon(ribbon.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1">Display Name *</label>
                  <input value={ribbon.label}
                    onChange={e => updateRibbon(ribbon.id, "label", e.target.value)}
                    placeholder="e.g. Classic Gold"
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground block mb-1">Add-on Price (AED)</label>
                  <input type="number" value={ribbon.price} min={0} step={5}
                    onChange={e => updateRibbon(ribbon.id, "price", parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">Set 0 for no extra charge</p>
                </div>
              </div>
              {/* Preview */}
              <div className="mt-3 bg-muted rounded-xl px-4 py-2 font-body text-xs text-muted-foreground">
                Preview: <span className="font-semibold text-foreground">{ribbon.label || "?"}</span>
                {ribbon.price > 0 ? ` (+AED ${ribbon.price})` : " (Free)"}
              </div>
            </div>
          ))}

          <button onClick={addRibbon} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border font-body text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
            <Plus size={16} /> Add Ribbon
          </button>

          {/* Preview */}
          <div className="bg-muted rounded-2xl p-4">
            <p className="font-body text-xs text-muted-foreground mb-3">Customer preview:</p>
            <div className="flex flex-wrap gap-2">
              {ribbons.filter(r => r.label).map(ribbon => (
                <span key={ribbon.id} className="px-4 py-2 rounded-full bg-card border border-border font-body text-xs font-medium">
                  {ribbon.label}{ribbon.price > 0 ? ` (+AED ${ribbon.price})` : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SQL Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
        <p className="font-body text-sm font-semibold text-amber-800">⚠️ Supabase SQL Setup Required</p>
        <p className="font-body text-xs text-amber-700">Run this SQL in Supabase SQL Editor to enable shared saving across all admins:</p>
        <pre className="bg-amber-100 rounded-xl p-3 font-mono text-xs text-amber-900 overflow-x-auto whitespace-pre-wrap">{SQL_SETUP}</pre>
      </div>
    </div>
  );
}

const SQL_SETUP = `-- Box Builder Settings Tables
create table if not exists app_box_sizes (
  id text primary key, label text not null, description text default '',
  max_items integer default 5, base_price numeric(10,2) default 0, sort_order integer default 0
);
create table if not exists app_box_colors (
  id text primary key, name text not null, sort_order integer default 0
);
create table if not exists app_box_ribbons (
  id text primary key, label text not null, value text not null,
  price numeric(10,2) default 0, sort_order integer default 0
);
alter table app_box_sizes   enable row level security;
alter table app_box_colors  enable row level security;
alter table app_box_ribbons enable row level security;
create policy "public read sizes"   on app_box_sizes   for select to anon, authenticated using (true);
create policy "public read colors"  on app_box_colors  for select to anon, authenticated using (true);
create policy "public read ribbons" on app_box_ribbons for select to anon, authenticated using (true);
create policy "service all sizes"   on app_box_sizes   for all to service_role using (true) with check (true);
create policy "service all colors"  on app_box_colors  for all to service_role using (true) with check (true);
create policy "service all ribbons" on app_box_ribbons for all to service_role using (true) with check (true);`;

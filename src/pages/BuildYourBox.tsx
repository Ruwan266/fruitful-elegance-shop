import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Package, ShoppingBag, X, Send, ImageIcon, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBoxItems, insertBoxMessage, fileToBase64, genId, type BoxItem } from "@/lib/sharedStore";
import { supabase } from "@/lib/supabase";

// ─── Default fallbacks ────────────────────────────────────────────────────────
const DEFAULT_SIZES = [
  { id: "s1", label: "S", description: "Up to 4 items", max_items: 4, base_price: 15, sort_order: 1 },
  { id: "s2", label: "M", description: "Up to 6 items", max_items: 6, base_price: 25, sort_order: 2 },
  { id: "s3", label: "L", description: "Up to 10 items", max_items: 10, base_price: 35, sort_order: 3 },
];
const DEFAULT_COLORS  = ["Forest Green", "Gold", "Cream", "Berry Red"];
const DEFAULT_RIBBONS = [
  { id: "r1", label: "Classic Gold",  value: "classic-gold",  price: 0,  sort_order: 1 },
  { id: "r2", label: "Satin Red",     value: "satin-red",     price: 5,  sort_order: 2 },
  { id: "r3", label: "Forest Green",  value: "forest-green",  price: 5,  sort_order: 3 },
  { id: "r4", label: "Pearl White",   value: "pearl-white",   price: 8,  sort_order: 4 },
  { id: "r5", label: "Royal Purple",  value: "royal-purple",  price: 8,  sort_order: 5 },
];

const FILTER_TABS = ["all", "fruits", "nuts", "berries", "dates", "extras", "snacks", "chocolates"];
interface SelectedItem { id: string; name: string; price: number; quantity: number; image: string; max_quantity: number; }

// ─── Load settings from Supabase ─────────────────────────────────────────────
async function loadSettings() {
  try {
    const [sizesRes, colorsRes, ribbonsRes] = await Promise.all([
      supabase.from("app_box_sizes").select("*").order("sort_order"),
      supabase.from("app_box_colors").select("*").order("sort_order"),
      supabase.from("app_box_ribbons").select("*").order("sort_order"),
    ]);
    return {
      sizes:   sizesRes.data?.length   ? sizesRes.data   : DEFAULT_SIZES,
      colors:  colorsRes.data?.length  ? colorsRes.data.map((c: any) => c.name) : DEFAULT_COLORS,
      ribbons: ribbonsRes.data?.length ? ribbonsRes.data : DEFAULT_RIBBONS,
    };
  } catch {
    return { sizes: DEFAULT_SIZES, colors: DEFAULT_COLORS, ribbons: DEFAULT_RIBBONS };
  }
}

export default function BuildYourBox() {
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedColor,   setSelectedColor]   = useState(0);
  const [selectedRibbon,  setSelectedRibbon]  = useState(0);
  const [selectedTab,     setSelectedTab]     = useState("all");
  const [boxItems,        setBoxItems]        = useState<SelectedItem[]>([]);
  const [dbItems,         setDbItems]         = useState<BoxItem[]>([]);
  const [loadingItems,    setLoadingItems]    = useState(true);
  const [messageText,     setMessageText]     = useState("");
  const [messageImage,    setMessageImage]    = useState("");
  const [uploadingImg,    setUploadingImg]    = useState(false);
  const [messageSent,     setMessageSent]     = useState(false);
  const [submitting,      setSubmitting]      = useState(false);

  const [sizes,   setSizes]   = useState(DEFAULT_SIZES);
  const [colors,  setColors]  = useState<string[]>(DEFAULT_COLORS);
  const [ribbons, setRibbons] = useState(DEFAULT_RIBBONS);

  const { addToCart } = useCart();
  const { customer }  = useAuth();
  const { toast }     = useToast();
  const fileRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([getBoxItems(true), loadSettings()]).then(([items, settings]) => {
      setDbItems(items);
      setSizes(settings.sizes);
      setColors(settings.colors);
      setRibbons(settings.ribbons);
      setLoadingItems(false);
    });
  }, []);

  const boxSize        = sizes[selectedSizeIdx] || DEFAULT_SIZES[0];
  const ribbon         = ribbons[selectedRibbon] || DEFAULT_RIBBONS[0];
  const totalItemCount = boxItems.reduce((s, i) => s + i.quantity, 0);
  const itemsPrice     = boxItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalPrice     = itemsPrice + (boxSize.base_price || 0) + (ribbon.price || 0);
  const filteredItems  = selectedTab === "all" ? dbItems : dbItems.filter(i => i.category === selectedTab);

  function addItem(item: BoxItem) {
    if (totalItemCount >= boxSize.max_items) {
      toast({ title: "Box is full!", description: `Size ${boxSize.label} holds max ${boxSize.max_items} items.`, variant: "destructive" }); return;
    }
    setBoxItems(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) {
        if (ex.quantity >= item.max_quantity) { toast({ title: `Max ${item.max_quantity} allowed`, variant: "destructive" }); return prev; }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image, max_quantity: item.max_quantity }];
    });
  }

  function removeItem(id: string) {
    setBoxItems(prev => {
      const ex = prev.find(i => i.id === id);
      if (ex && ex.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  }

  async function uploadMessageImage(file: File) {
    setUploadingImg(true);
    try {
      const base64 = await fileToBase64(file);
      setMessageImage(base64);
      toast({ title: "Image attached ✓" });
    } catch { toast({ title: "Upload failed", variant: "destructive" }); }
    setUploadingImg(false);
  }

  async function sendMessage() {
    if (!messageText.trim() && !messageImage) { toast({ title: "Please write a message or attach an image", variant: "destructive" }); return; }
    try {
      await insertBoxMessage({
        customer_name:  customer ? `${customer.firstName} ${customer.lastName}` : "Guest",
        customer_email: customer?.email || "",
        message:        messageText.trim(),
        image:          messageImage,
        box_details: {
          size: boxSize.label, color: colors[selectedColor] || "",
          ribbon: ribbon.label,
          items: boxItems.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
          total: totalPrice,
        },
        read: false,
      });
      setMessageSent(true);
      toast({ title: "Message sent! ✓", description: "We'll get back to you soon." });
    } catch (e: any) {
      toast({ title: "Error sending message", description: e.message, variant: "destructive" });
    }
  }

  async function handleAddToCart() {
    if (boxItems.length === 0) { toast({ title: "Add items to your box first", variant: "destructive" }); return; }
    setSubmitting(true);
    if (messageText.trim() && !messageSent) await sendMessage();
    const customProduct = {
      id: `custom-${genId()}`, title: `Custom Box (${boxSize.label}) — ${colors[selectedColor] || ""}`,
      price: totalPrice, image: boxItems[0]?.image || "", images: [], category: "gift-boxes",
      rating: 5, reviewCount: 0, description: `Custom box with ${totalItemCount} items`,
      sizes: [], colors: [], inStock: true, sku: "", tags: [],
    } as any;
    addToCart(customProduct, 1, boxSize.label, colors[selectedColor] || "");
    toast({ title: "Custom box added to cart! 🎁" });
    setBoxItems([]); setMessageText(""); setMessageImage(""); setMessageSent(false); setSubmitting(false);
  }

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          <div className="text-center mb-12">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Personalize</span>
            <h1 className="font-display text-3xl md:text-5xl font-semibold mt-2">Build Your Own Box</h1>
            <p className="font-body text-muted-foreground mt-2 max-w-lg mx-auto">Create a bespoke gift box. Choose your size, pick your favourites, and we'll wrap it beautifully.</p>
          </div>

          {/* Step 1: Size */}
          <div className="mb-12">
            <StepHeader n={1} label="Choose Box Size" />
            <div className="flex flex-wrap gap-4">
              {sizes.map((size, i) => (
                <button key={size.id} onClick={() => { setSelectedSizeIdx(i); setBoxItems([]); }}
                  className={`p-5 rounded-2xl text-center transition-all btn-press min-w-[110px] ${selectedSizeIdx === i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                  <span className="font-display text-2xl font-semibold">{size.label}</span>
                  <p className="font-body text-xs mt-1 opacity-80">{size.description}</p>
                  <p className="font-body text-xs mt-1 opacity-60">+AED {size.base_price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Color */}
          <div className="mb-12">
            <StepHeader n={2} label="Choose Box Color" />
            <div className="flex flex-wrap gap-3">
              {colors.map((color, i) => (
                <button key={i} onClick={() => setSelectedColor(i)}
                  className={`px-5 py-3 rounded-full font-body text-xs font-medium transition-all btn-press ${selectedColor === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Ribbon */}
          <div className="mb-12">
            <StepHeader n={3} label="Choose Ribbon" />
            <div className="flex flex-wrap gap-3">
              {ribbons.map((r, i) => (
                <button key={r.id} onClick={() => setSelectedRibbon(i)}
                  className={`px-5 py-3 rounded-full font-body text-xs font-medium transition-all btn-press ${selectedRibbon === i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                  {r.label}{r.price > 0 ? ` (+AED ${r.price})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 + Summary */}
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <StepBadge n={4} />
                  <h2 className="font-display text-xl font-semibold">Select Your Items</h2>
                  <span className="font-body text-xs text-muted-foreground ml-auto">{totalItemCount}/{boxSize.max_items} selected</span>
                </div>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {FILTER_TABS.map(tab => (
                    <button key={tab} onClick={() => setSelectedTab(tab)}
                      className={`badge-pill whitespace-nowrap transition-all btn-press capitalize ${selectedTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                {loadingItems ? (
                  <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-12 bg-muted rounded-2xl"><Package size={32} className="text-muted-foreground/30 mx-auto mb-2" /><p className="font-body text-sm text-muted-foreground">No items in this category yet.</p></div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredItems.map(item => {
                      const inBox = boxItems.find(i => i.id === item.id);
                      const atMax = inBox && inBox.quantity >= item.max_quantity;
                      const boxFull = totalItemCount >= boxSize.max_items && !inBox;
                      const disabled = boxFull || !!atMax;
                      return (
                        <motion.div key={item.id} whileTap={{ scale: 0.97 }}
                          className={`card-premium p-3 text-left cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${inBox ? "ring-2 ring-primary" : ""}`}
                          onClick={() => !disabled && addItem(item)}>
                          <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3 relative">
                            {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-muted-foreground/30" /></div>}
                            {atMax && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white font-body text-xs font-semibold">Max reached</span></div>}
                          </div>
                          <h4 className="font-body text-sm font-medium line-clamp-1">{item.name}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-body text-xs text-muted-foreground">AED {item.price}</span>
                            <span className="font-body text-[10px] text-muted-foreground">max ×{item.max_quantity}</span>
                          </div>
                          {inBox && (
                            <div className="flex items-center justify-between mt-2">
                              <button onClick={e => { e.stopPropagation(); removeItem(item.id); }} className="p-1 text-muted-foreground hover:text-primary"><Minus size={12} /></button>
                              <span className="badge-pill bg-primary text-primary-foreground text-[10px] px-2">×{inBox.quantity}</span>
                              <button onClick={e => { e.stopPropagation(); addItem(item); }} disabled={disabled} className="p-1 text-muted-foreground hover:text-primary disabled:opacity-40"><Plus size={12} /></button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 5: Message */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <StepBadge n={5} />
                  <h2 className="font-display text-xl font-semibold">Add a Personal Message</h2>
                  <span className="font-body text-xs text-muted-foreground">(Optional)</span>
                </div>
                {messageSent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-premium p-6 flex items-center gap-4 bg-green-50 border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><MessageSquare size={20} className="text-white" /></div>
                    <div><p className="font-body text-sm font-semibold text-green-800">Message sent! ✓</p><p className="font-body text-xs text-green-600 mt-0.5">We'll review and reach out soon.</p></div>
                    <button onClick={() => { setMessageSent(false); setMessageText(""); setMessageImage(""); }} className="ml-auto font-body text-xs text-green-600 hover:text-green-800 underline">Edit</button>
                  </motion.div>
                ) : (
                  <div className="card-premium p-5 space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground"><MessageSquare size={14} /><span className="font-body text-xs">Your message will be sent directly to our team.</span></div>
                    <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={4}
                      placeholder="Write your personal message here... (e.g. Happy Birthday! 🎉)"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground" />
                    {messageImage && (
                      <div className="relative inline-block">
                        <img src={messageImage} alt="attachment" className="h-24 rounded-xl object-cover border border-border" />
                        <button onClick={() => setMessageImage("")} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"><X size={10} /></button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      <button onClick={() => fileRef.current?.click()} disabled={uploadingImg} className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl font-body text-xs hover:bg-muted transition-all">
                        {uploadingImg ? <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> : <ImageIcon size={13} />} Attach Photo
                      </button>
                      <div className="flex-1" />
                      <button onClick={sendMessage} disabled={!messageText.trim() && !messageImage}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl font-body text-xs font-semibold hover:brightness-110 disabled:opacity-40 transition-all">
                        <Send size={13} /> Send Message
                      </button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMessageImage(e.target.files[0])} />
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
              <div className="card-premium p-8 space-y-6" style={{ borderRadius: "32px" }}>
                <h3 className="font-display text-xl font-semibold">Your Custom Box</h3>
                <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
                  <Package size={14} /><span>Size {boxSize.label}</span><span>·</span>
                  <span>{colors[selectedColor] || ""}</span><span>·</span><span>{ribbon.label} ribbon</span>
                </div>
                <div className="aspect-square bg-muted rounded-2xl p-4 flex flex-wrap content-start gap-2 border-2 border-dashed border-border relative overflow-hidden">
                  {boxItems.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center"><p className="font-display text-sm text-muted-foreground italic">Your box is empty...</p></div>
                  ) : (
                    <AnimatePresence>
                      {boxItems.flatMap(item => [...Array(item.quantity)].map((_, qi) => (
                        <motion.div key={`${item.id}-${qi}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                          {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-body text-center p-1">{item.name.slice(0, 8)}</div>}
                        </motion.div>
                      )))}
                    </AnimatePresence>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/40 text-white font-body text-[10px] px-2 py-0.5 rounded-full">{totalItemCount}/{boxSize.max_items}</div>
                </div>
                {boxItems.length > 0 && (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {boxItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <span className="font-body text-sm flex-1 truncate">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => removeItem(item.id)} className="p-1 btn-press text-muted-foreground hover:text-primary"><Minus size={12} /></button>
                          <span className="font-body text-xs w-5 text-center">{item.quantity}</span>
                          <button onClick={() => addItem(dbItems.find(d => d.id === item.id)!)} disabled={totalItemCount >= boxSize.max_items || item.quantity >= item.max_quantity} className="p-1 btn-press text-muted-foreground hover:text-primary disabled:opacity-40"><Plus size={12} /></button>
                        </div>
                        <span className="font-body text-xs text-muted-foreground w-16 text-right">AED {item.price * item.quantity}</span>
                        <button onClick={() => setBoxItems(prev => prev.filter(i => i.id !== item.id))} className="p-1 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Box ({boxSize.label})</span><span>AED {boxSize.base_price}</span></div>
                  {ribbon.price > 0 && <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">{ribbon.label}</span><span>AED {ribbon.price}</span></div>}
                  <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Items ({totalItemCount})</span><span>AED {itemsPrice}</span></div>
                  <div className="flex justify-between font-body text-lg font-semibold pt-2 border-t border-border"><span>Total</span><span>AED {totalPrice}</span></div>
                </div>
                {messageSent && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                    <MessageSquare size={13} className="text-green-600 flex-shrink-0" /><p className="font-body text-xs text-green-700">Message sent to our team ✓</p>
                  </div>
                )}
                <button onClick={handleAddToCart} disabled={boxItems.length === 0 || submitting}
                  className={`w-full py-4 rounded-full font-body text-sm font-semibold flex items-center justify-center gap-2 transition-all btn-press ${boxItems.length > 0 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
                  {submitting ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <ShoppingBag size={18} />}
                  {submitting ? "Adding..." : "Add Custom Box to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function StepHeader({ n, label }: { n: number; label: string }) {
  return <div className="flex items-center gap-3 mb-6"><StepBadge n={n} /><h2 className="font-display text-xl font-semibold">{label}</h2></div>;
}
function StepBadge({ n }: { n: number }) {
  return <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-semibold flex-shrink-0">{n}</div>;
}

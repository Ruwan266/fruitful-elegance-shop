import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Package, ShoppingBag, X, Bold, Italic, Underline, Image as ImageIcon, Upload, MessageSquare, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BoxItem { id: string; name: string; price: number; quantity: number; image_url: string; max_quantity: number; }

const DEFAULT_SIZES = [
  { label: "S", description: "Up to 4 items", maxItems: 4, basePrice: 15 },
  { label: "M", description: "Up to 6 items", maxItems: 6, basePrice: 25 },
  { label: "L", description: "Up to 10 items", maxItems: 10, basePrice: 35 },
];
const DEFAULT_COLORS = ["Forest Green", "Gold", "Cream", "Berry Red"];
const DEFAULT_RIBBONS = [
  { label: "Classic Gold", value: "classic-gold", price: 0 },
  { label: "Satin Red",    value: "satin-red",    price: 5 },
  { label: "Forest Green", value: "forest-green", price: 5 },
  { label: "Pearl White",  value: "pearl-white",  price: 8 },
  { label: "Royal Purple", value: "royal-purple", price: 8 },
];
const FILTER_TABS = ["all", "fruits", "nuts", "berries", "dates", "extras", "snacks", "chocolates"];

export default function BuildYourBox() {
  const [selectedSize, setSelectedSize] = useState(1);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedRibbon, setSelectedRibbon] = useState(0);
  const [selectedTab, setSelectedTab] = useState("all");
  const [boxItems, setBoxItems] = useState<BoxItem[]>([]);
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [sizes, setSizes] = useState(DEFAULT_SIZES);
  const [colors] = useState(DEFAULT_COLORS);
  const [ribbons] = useState(DEFAULT_RIBBONS);
  const [loadingItems, setLoadingItems] = useState(true);

  // Message state
  const [messageText, setMessageText] = useState("");
  const [messageImage, setMessageImage] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { addToCart } = useCart();
  const { customer } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoadingItems(true);
    const { data } = await supabase.from("box_builder_items").select("*").eq("is_active", true).order("sort_order").order("name");
    setDbItems(data || []);
    setLoadingItems(false);
  }

  const boxSize = sizes[selectedSize];
  const ribbon = ribbons[selectedRibbon];
  const totalItemCount = boxItems.reduce((s, i) => s + i.quantity, 0);
  const itemsPrice = boxItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalPrice = itemsPrice + boxSize.basePrice + ribbon.price;

  const filteredItems = selectedTab === "all"
    ? dbItems
    : dbItems.filter(i => i.category === selectedTab);

  function addItem(item: any) {
    if (totalItemCount >= boxSize.maxItems) {
      toast({ title: "Box is full!", description: `Size ${boxSize.label} holds max ${boxSize.maxItems} items.`, variant: "destructive" }); return;
    }
    setBoxItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.quantity >= item.max_quantity) {
          toast({ title: `Max ${item.max_quantity} of this item allowed`, variant: "destructive" }); return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url, max_quantity: item.max_quantity }];
    });
  }

  function removeItem(id: string) {
    setBoxItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.id !== id);
    });
  }

  // Rich text formatting
  function applyFormat(cmd: string) {
    document.execCommand(cmd, false);
    msgRef.current?.focus();
  }

  async function uploadMessageImage(file: File) {
    setUploadingImg(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `msgimg_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("messages").upload(fileName, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabase.storage.from("messages").getPublicUrl(fileName);
      setMessageImage(data.publicUrl);
      toast({ title: "Image attached" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setUploadingImg(false);
  }

  async function handleAddToCart() {
    if (boxItems.length === 0) {
      toast({ title: "Add items to your box first", variant: "destructive" }); return;
    }
    setSubmitting(true);
    try {
      const msgHtml = msgRef.current?.innerHTML || "";
      const msgText = msgRef.current?.innerText || "";

      // Save custom box to Supabase
      const { data: boxData, error: boxErr } = await supabase.from("custom_boxes").insert({
        customer_email: customer?.email || "guest",
        customer_name: customer ? `${customer.firstName} ${customer.lastName}` : "Guest",
        box_size: boxSize.label,
        box_color: colors[selectedColor],
        ribbon: ribbon.label,
        items: boxItems.map(i => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price })),
        message_text: msgText,
        message_html: msgHtml,
        message_image_url: messageImage,
        total_price: totalPrice,
        status: "pending",
      }).select().single();

      if (!boxErr && boxData && msgText.trim()) {
        // Create conversation for message
        const { data: convData } = await supabase.from("conversations").insert({
          customer_email: customer?.email || "guest",
          customer_name: customer ? `${customer.firstName} ${customer.lastName}` : "Guest",
          custom_box_id: boxData.id,
          subject: `Custom Box Order — ${boxSize.label} / ${colors[selectedColor]}`,
          status: "open",
          unread_admin: 1,
        }).select().single();

        if (convData) {
          await supabase.from("messages").insert({
            conversation_id: convData.id,
            sender_type: "customer",
            sender_name: customer ? `${customer.firstName} ${customer.lastName}` : "Guest",
            content: msgText,
            content_html: msgHtml,
            image_url: messageImage,
          });
        }
      }

      // Add to cart as a special product
      const customProduct = {
        id: boxData?.id || `custom-${Date.now()}`,
        title: `Custom Box (${boxSize.label}) — ${colors[selectedColor]}`,
        price: totalPrice,
        image: boxItems[0]?.image_url || "",
        images: [],
        category: "gift-boxes",
        rating: 5, reviewCount: 0,
        description: `Custom box with ${totalItemCount} items`,
        sizes: [], colors: [], inStock: true, sku: "", tags: [],
      } as any;

      addToCart(customProduct, 1, boxSize.label, colors[selectedColor]);
      toast({ title: "Custom box added to cart!", description: msgText ? "Your message has been sent to us." : "" });

      // Reset
      setBoxItems([]); setMessageText(""); setMessageImage(null);
      if (msgRef.current) msgRef.current.innerHTML = "";
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSubmitting(false);
  }

  return (
    <Layout>
      <section className="section-spacing bg-background">
        <div className="container-premium">
          <div className="text-center mb-12">
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Personalize</span>
            <h1 className="font-display text-3xl md:text-5xl font-semibold mt-2">Build Your Own Box</h1>
            <p className="font-body text-muted-foreground mt-2 max-w-lg mx-auto">
              Create a bespoke gift box. Choose your size, pick your favourites, and we'll wrap it beautifully.
            </p>
          </div>

          {/* Step 1: Size */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-semibold">1</div>
              <h2 className="font-display text-xl font-semibold">Choose Box Size</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              {sizes.map((size, i) => (
                <button key={size.label} onClick={() => { setSelectedSize(i); setBoxItems([]); }}
                  className={`p-5 rounded-2xl text-center transition-all btn-press ${selectedSize===i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                  <span className="font-display text-2xl font-semibold">{size.label}</span>
                  <p className="font-body text-xs mt-1 opacity-80">{size.description}</p>
                  <p className="font-body text-xs mt-1 opacity-60">+AED {size.basePrice}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Color */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-semibold">2</div>
              <h2 className="font-display text-xl font-semibold">Choose Box Color</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {colors.map((color, i) => (
                <button key={color} onClick={() => setSelectedColor(i)}
                  className={`px-5 py-3 rounded-full font-body text-xs font-medium transition-all btn-press ${selectedColor===i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Ribbon */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-semibold">3</div>
              <h2 className="font-display text-xl font-semibold">Choose Ribbon</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {ribbons.map((r, i) => (
                <button key={r.value} onClick={() => setSelectedRibbon(i)}
                  className={`px-5 py-3 rounded-full font-body text-xs font-medium transition-all btn-press ${selectedRibbon===i ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                  {r.label}{r.price > 0 ? ` (+AED ${r.price})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4 + 5: Items + Summary */}
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-semibold">4</div>
                <h2 className="font-display text-xl font-semibold">Select Your Items</h2>
                <span className="font-body text-xs text-muted-foreground ml-auto">{totalItemCount}/{boxSize.maxItems} selected</span>
              </div>

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {FILTER_TABS.map(tab => (
                  <button key={tab} onClick={() => setSelectedTab(tab)}
                    className={`badge-pill whitespace-nowrap transition-all btn-press capitalize ${selectedTab===tab ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {loadingItems ? (
                <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-muted rounded-2xl">
                  <Package size={32} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="font-body text-sm text-muted-foreground">No items in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredItems.map(item => {
                    const inBox = boxItems.find(i => i.id === item.id);
                    const atMax = inBox && inBox.quantity >= item.max_quantity;
                    const boxFull = totalItemCount >= boxSize.maxItems && !inBox;
                    const disabled = boxFull || !!atMax;
                    return (
                      <motion.div key={item.id} whileTap={{ scale: 0.97 }}
                        className={`card-premium p-3 text-left transition-all cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${inBox ? "ring-2 ring-primary" : ""}`}
                        onClick={() => !disabled && addItem(item)}>
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-3 relative">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-muted-foreground/30" /></div>
                          )}
                          {atMax && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white font-body text-xs font-semibold">Max reached</span>
                            </div>
                          )}
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

              {/* Step 5: Message */}
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-body text-sm font-semibold">5</div>
                  <h2 className="font-display text-xl font-semibold">Add a Personal Message</h2>
                  <span className="font-body text-xs text-muted-foreground">(Optional)</span>
                </div>
                <div className="card-premium p-5 space-y-3">
                  {/* Formatting toolbar */}
                  <div className="flex items-center gap-1 pb-2 border-b border-border">
                    <button onClick={() => applyFormat("bold")} className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Bold"><Bold size={14} /></button>
                    <button onClick={() => applyFormat("italic")} className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Italic"><Italic size={14} /></button>
                    <button onClick={() => applyFormat("underline")} className="p-1.5 rounded-lg hover:bg-muted transition-all" title="Underline"><Underline size={14} /></button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <button onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                      className="p-1.5 rounded-lg hover:bg-muted transition-all flex items-center gap-1.5 font-body text-xs" title="Attach image">
                      {uploadingImg ? <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
                      Attach photo
                    </button>
                  </div>

                  {/* Rich text area */}
                  <div
                    ref={msgRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={e => setMessageText((e.target as HTMLDivElement).innerText)}
                    data-placeholder="Write your personal message here... (e.g. Happy Birthday! Wishing you all the best 🎉)"
                    className="min-h-[100px] font-body text-sm focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
                  />

                  {/* Image preview */}
                  {messageImage && (
                    <div className="relative inline-block">
                      <img src={messageImage} alt="attachment" className="h-24 rounded-xl object-cover border border-border" />
                      <button onClick={() => setMessageImage(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare size={12} />
                    <span>Your message will be included with the gift and we may follow up with you.</span>
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadMessageImage(e.target.files[0])} />
              </div>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
              <div className="card-premium p-8 space-y-6" style={{ borderRadius: "32px" }}>
                <h3 className="font-display text-xl font-semibold">Your Custom Box</h3>
                <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
                  <Package size={14} />
                  <span>Size {boxSize.label}</span>
                  <span>·</span>
                  <span>{colors[selectedColor]}</span>
                  <span>·</span>
                  <span>{ribbon.label} ribbon</span>
                </div>

                {/* Visual Box */}
                <div className="aspect-square bg-muted rounded-2xl p-4 flex flex-wrap content-start gap-2 border-2 border-dashed border-border relative overflow-hidden">
                  {boxItems.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="font-display text-sm text-muted-foreground italic">Your box is empty...</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {boxItems.map(item =>
                        [...Array(item.quantity)].map((_, qi) => (
                          <motion.div key={`${item.id}-${qi}`} initial={{ scale:0, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0, opacity:0 }} className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-body text-center p-1">{item.name.slice(0,8)}</div>
                            )}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  )}
                  {/* Capacity indicator */}
                  <div className="absolute bottom-2 right-2 bg-black/40 text-white font-body text-[10px] px-2 py-0.5 rounded-full">
                    {totalItemCount}/{boxSize.maxItems}
                  </div>
                </div>

                {/* Items list */}
                {boxItems.length > 0 && (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {boxItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <span className="font-body text-sm flex-1 truncate">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => removeItem(item.id)} className="p-1 btn-press text-muted-foreground hover:text-primary"><Minus size={12} /></button>
                          <span className="font-body text-xs w-5 text-center">{item.quantity}</span>
                          <button onClick={() => addItem(dbItems.find(d => d.id === item.id)!)} className="p-1 btn-press text-muted-foreground hover:text-primary disabled:opacity-40" disabled={totalItemCount >= boxSize.maxItems || item.quantity >= item.max_quantity}><Plus size={12} /></button>
                        </div>
                        <span className="font-body text-xs text-muted-foreground w-16 text-right">AED {item.price * item.quantity}</span>
                        <button onClick={() => setBoxItems(prev => prev.filter(i => i.id !== item.id))} className="p-1 text-muted-foreground hover:text-destructive"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Box ({boxSize.label})</span>
                    <span>AED {boxSize.basePrice}</span>
                  </div>
                  {ribbon.price > 0 && (
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">{ribbon.label} ribbon</span>
                      <span>AED {ribbon.price}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-muted-foreground">Items ({totalItemCount})</span>
                    <span>AED {itemsPrice}</span>
                  </div>
                  <div className="flex justify-between font-body text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span>AED {totalPrice}</span>
                  </div>
                </div>

                {messageText.trim() && (
                  <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3">
                    <MessageSquare size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    <p className="font-body text-xs text-muted-foreground line-clamp-2">"{messageText.trim()}"</p>
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

import { useEffect, useState, useRef } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { MessageSquare, Send, Image as ImageIcon, X, ChevronLeft, CheckCheck, Upload, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [attachUrl, setAttachUrl] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (selected) loadMessages(selected.id); }, [selected]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!selected) return;
    const sub = supabaseAdmin
      .channel(`messages:${selected.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selected.id}` },
        () => loadMessages(selected.id))
      .subscribe();
    return () => { supabaseAdmin.removeChannel(sub); };
  }, [selected?.id]);

  async function loadConversations() {
    setLoading(true);
    const { data } = await supabaseAdmin
      .from("conversations")
      .select("*, messages(id, content, sender_type, created_at, is_read)")
      .order("last_message_at", { ascending: false });
    setConversations(data || []);
    setLoading(false);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");
    setMessages(data || []);
    // Mark customer messages as read
    await supabaseAdmin.from("messages").update({ is_read: true })
      .eq("conversation_id", convId).eq("sender_type", "customer");
    await supabaseAdmin.from("conversations").update({ unread_admin: 0 }).eq("id", convId);
  }

  async function uploadAttachment(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `msg_${Date.now()}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("messages").upload(fileName, file, { cacheControl: "3600" });
      if (error) throw error;
      const { data } = supabaseAdmin.storage.from("messages").getPublicUrl(fileName);
      setAttachUrl(data.publicUrl);
      toast({ title: "Image attached" });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    }
    setUploading(false);
  }

  async function sendReply() {
    if (!reply.trim() && !attachUrl) return;
    if (!selected) return;
    setSending(true);
    try {
      // Insert admin message
      const { error: msgErr } = await supabaseAdmin.from("messages").insert({
        conversation_id: selected.id,
        sender_type: "admin",
        sender_name: "FruitFlix Team",
        content: reply.trim(),
        image_url: attachUrl || null,
        is_read: false,
      });
      if (msgErr) throw msgErr;

      // Update conversation
      await supabaseAdmin.from("conversations").update({
        last_message_at: new Date().toISOString(),
        unread_customer: selected.unread_customer + 1,
      }).eq("id", selected.id);

      // Send notification to customer
      await supabaseAdmin.from("notifications").insert({
        customer_email: selected.customer_email,
        type: "message_reply",
        title: "New reply from FruitFlix",
        body: reply.trim().slice(0, 100),
        link: "/account?tab=messages",
        data: { conversation_id: selected.id },
      });

      setReply(""); setAttachUrl("");
      loadMessages(selected.id);
      loadConversations();
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    }
    setSending(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabaseAdmin.from("conversations").update({ status }).eq("id", id);
    loadConversations();
    if (selected?.id === id) setSelected((p: any) => ({ ...p, status }));
  }

  const statusColor: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    resolved: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-card rounded-2xl border border-border overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full lg:w-80 border-r border-border flex flex-col ${selected ? "hidden lg:flex" : "flex"}`}>
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-base font-semibold">Messages</h2>
          <p className="font-body text-xs text-muted-foreground mt-0.5">{conversations.length} conversations</p>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageSquare size={32} className="text-muted-foreground/30 mb-2" />
            <p className="font-body text-sm text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.map(conv => (
              <button key={conv.id} onClick={() => setSelected(conv)}
                className={`w-full p-4 text-left hover:bg-muted/50 transition-all ${selected?.id === conv.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold truncate">{conv.customer_name || conv.customer_email}</p>
                    <p className="font-body text-xs text-muted-foreground truncate">{conv.subject}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColor[conv.status] || "bg-gray-100 text-gray-600"}`}>{conv.status}</span>
                    {conv.unread_admin > 0 && (
                      <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">{conv.unread_admin}</span>
                    )}
                  </div>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {new Date(conv.last_message_at).toLocaleDateString("en-AE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {selected ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="lg:hidden p-1.5 hover:bg-muted rounded-lg"><ChevronLeft size={16} /></button>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-display text-sm font-semibold text-primary">
              {(selected.customer_name || selected.customer_email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold truncate">{selected.customer_name || selected.customer_email}</p>
              <p className="font-body text-xs text-muted-foreground truncate">{selected.customer_email}</p>
            </div>
            <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
              className="text-xs font-body border border-border rounded-lg px-2 py-1 bg-background focus:outline-none">
              {["open","resolved","archived"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_type === "admin" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                  {msg.sender_type === "customer" && (
                    <p className="font-body text-[10px] font-semibold opacity-70 mb-1">{selected.customer_name}</p>
                  )}
                  {msg.content && <p className="font-body text-sm leading-relaxed">{msg.content}</p>}
                  {msg.image_url && (
                    <img src={msg.image_url} alt="attachment" className="mt-2 rounded-xl max-w-full max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.image_url, "_blank")} />
                  )}
                  <p className={`font-body text-[10px] mt-1 ${msg.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit" })}
                    {msg.sender_type === "admin" && <CheckCheck size={10} className="inline ml-1" />}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Attachment Preview */}
          {attachUrl && (
            <div className="px-4 pb-2">
              <div className="relative inline-block">
                <img src={attachUrl} alt="attachment" className="h-16 rounded-lg object-cover border border-border" />
                <button onClick={() => setAttachUrl("")} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <X size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Reply Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2 items-end">
              <div className="flex-1 bg-muted rounded-2xl flex items-end gap-2 px-4 py-2 min-h-[44px]">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type a reply..."
                  rows={1}
                  className="flex-1 bg-transparent font-body text-sm resize-none focus:outline-none py-1 max-h-24"
                />
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                  {uploading ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <ImageIcon size={16} />}
                </button>
              </div>
              <button onClick={sendReply} disabled={sending || (!reply.trim() && !attachUrl)}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 disabled:opacity-40 transition-all flex-shrink-0">
                <Send size={16} />
              </button>
            </div>
            <p className="font-body text-[10px] text-muted-foreground mt-1.5 text-center">Enter to send • Shift+Enter for new line</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAttachment(e.target.files[0])} />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center flex-col gap-3 text-center">
          <MessageSquare size={48} className="text-muted-foreground/20" />
          <p className="font-body text-sm text-muted-foreground">Select a conversation to view</p>
        </div>
      )}
    </div>
  );
}

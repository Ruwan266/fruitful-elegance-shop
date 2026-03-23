import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, LayoutDashboard, ShoppingBag, Users, BarChart3, Package, Settings, FileText, Box, LogOut, Menu, ExternalLink, MessageSquare, FolderOpen, Bell, Tag, Truck } from "lucide-react";
import Dashboard from "@/admin/Dashboard";
import Products from "@/admin/Products";
import Orders from "@/admin/Orders";
import Customers from "@/admin/Customers";
import Analytics from "@/admin/Analytics";
import BoxBuilder from "@/admin/BoxBuilder";
import Categories from "@/admin/Categories";
import Messages from "@/admin/Messages";
import Content from "@/admin/Content";
import SettingsPage from "@/admin/Settings";
import Offers from "@/admin/Offers";
import Delivery from "@/admin/Delivery";
import { getStore, KEYS, type BoxMessage } from "@/lib/sharedStore";

const ADMIN_SESSION = "fruitflix_admin_v2";

const NAV = [
  { id: "dashboard",   label: "Dashboard",     icon: LayoutDashboard },
  { id: "products",    label: "Products",       icon: Package },
  { id: "categories",  label: "Categories",     icon: FolderOpen },
  { id: "offers",      label: "Offers",         icon: Tag },
  { id: "orders",      label: "Orders",         icon: ShoppingBag },
  { id: "customers",   label: "Customers",      icon: Users },
  { id: "analytics",   label: "Analytics",      icon: BarChart3 },
  { id: "box-builder", label: "Box Builder",    icon: Box },
  { id: "delivery",    label: "Delivery",       icon: Truck },
  { id: "messages",    label: "Messages",       icon: MessageSquare },
  { id: "content",     label: "Content",        icon: FileText },
  { id: "settings",    label: "Settings",       icon: Settings },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION) === "true") setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => clearInterval(interval);
  }, [authed]);

  function loadUnread() {
    const msgs = getStore<BoxMessage[]>(KEYS.BOX_MESSAGES, []);
    setUnreadMessages(msgs.filter(m => !m.read).length);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const adminPw = (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_ADMIN_PASSWORD) || "FruitFlix2024!";
    if (pw === adminPw) { sessionStorage.setItem(ADMIN_SESSION, "true"); setAuthed(true); }
    else alert("Incorrect password");
  }

  function logout() { sessionStorage.removeItem(ADMIN_SESSION); setAuthed(false); }

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":   return <Dashboard />;
      case "products":    return <Products />;
      case "categories":  return <Categories />;
      case "offers":      return <Offers />;
      case "orders":      return <Orders />;
      case "customers":   return <Customers />;
      case "analytics":   return <Analytics />;
      case "box-builder": return <BoxBuilder />;
      case "delivery":    return <Delivery />;
      case "messages":    return <Messages />;
      case "content":     return <Content />;
      case "settings":    return <SettingsPage />;
      default:            return <Dashboard />;
    }
  };

  if (!authed) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4"><Lock className="w-7 h-7 text-primary" /></div>
          <h1 className="font-display text-2xl font-bold">FruitFlix Admin</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Staff access only</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)}
                placeholder="Admin password" required
                className="w-full pl-10 pr-10 h-12 rounded-xl border border-border bg-background/60 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-body text-sm font-semibold hover:brightness-110 transition-all">
              Enter Admin Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-60 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:relative lg:z-auto`}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 size={16} className="text-primary" /></div>
            <div><p className="font-display text-sm font-semibold">FruitFlix</p><p className="font-body text-[10px] text-muted-foreground">Admin Panel</p></div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm transition-all text-left ${activeTab === item.id ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <item.icon size={16} />
              {item.label}
              {item.id === "messages" && unreadMessages > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">{unreadMessages}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-left">
            <ExternalLink size={16} /> View Website
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-sm text-muted-foreground hover:text-destructive hover:bg-red-50 transition-all text-left">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-muted"><Menu size={18} /></button>
          <h2 className="font-body text-sm font-semibold capitalize lg:ml-0 ml-2">{NAV.find(n => n.id === activeTab)?.label}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveTab("messages"); setSidebarOpen(false); }} className="relative p-2 hover:bg-muted rounded-lg transition-all">
              <Bell size={16} />
              {unreadMessages > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">{unreadMessages}</span>}
            </button>
            <button onClick={() => window.open("/", "_blank")} className="px-3 py-1.5 rounded-lg border border-border font-body text-xs hover:bg-muted transition-all flex items-center gap-1.5">
              <ExternalLink size={12} /> Site
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{renderPage()}</main>
      </div>
    </div>
  );
}

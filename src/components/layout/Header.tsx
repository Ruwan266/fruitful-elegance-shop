import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, LogOut, Bell, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { getStore, KEYS, type Offer } from "@/lib/jsonStore";

const navLinks = [
  { label: "Home",          href: "/" },
  { label: "Shop",          href: "/shop" },
  { label: "Build Your Box",href: "/build-your-box" },
  { label: "Offers",        href: "/offers", highlight: true },
  { label: "Corporate",     href: "/shop?category=corporate" },
  { label: "About",         href: "/about" },
  { label: "Contact",       href: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [hasOffers, setHasOffers]   = useState(false);

  const { totalItems, setIsCartOpen }                           = useCart();
  const { customer, logout }                                     = useAuth();
  const { notifications, unreadCount, markRead, markAllRead }   = useNotifications();
  const location  = useLocation();
  const navigate  = useNavigate();
  const notifRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  // Check if there are active offers (for the badge)
  useEffect(() => {
    const now = new Date();
    const active = getStore<Offer[]>(KEYS.OFFERS, [])
      .filter(o => o.is_active && (!o.expires_at || new Date(o.expires_at) > now));
    setHasOffers(active.length > 0);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  function handleNotifClick(notif: any) {
    markRead(notif.id);
    setNotifOpen(false);
    if (notif.link) navigate(notif.link);
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-body tracking-wide">
        🎁 Complimentary Delivery Across UAE on Orders Above AED 200 | Same-Day Delivery Available
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm" : "bg-background"}`}>
        <div className="container-premium">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 btn-press">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-xl md:text-2xl font-semibold text-primary tracking-tight">FruitFlix</span>
              <span className="text-xs font-body text-gold font-medium tracking-widest uppercase">UAE</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium font-body transition-colors relative group ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                  {/* Underline hover */}
                  <span className={`absolute -bottom-0.5 left-0 w-full h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${location.pathname === link.href ? "scale-x-100" : ""}`} />
                  {/* Offers badge */}
                  {link.highlight && hasOffers && (
                    <span className="absolute -top-2.5 -right-3 flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-primary transition-colors btn-press hidden sm:block">
                <Search size={19} />
              </button>

              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 hover:text-primary transition-colors btn-press">
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-50">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <span className="font-body text-sm font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="font-body text-xs text-primary hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center font-body text-xs text-muted-foreground py-8">No notifications</p>
                        ) : notifications.map((n: any) => (
                          <button key={n.id} onClick={() => handleNotifClick(n)}
                            className={`w-full text-left p-4 hover:bg-muted transition-colors border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                            <p className="font-body text-xs font-medium">{n.title}</p>
                            <p className="font-body text-xs text-muted-foreground mt-0.5">{n.body}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Account */}
              {customer ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/account" className="p-2 hover:text-primary transition-colors btn-press"><User size={19} /></Link>
                  <button onClick={logout} className="p-2 hover:text-destructive transition-colors btn-press"><LogOut size={17} /></button>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block p-2 hover:text-primary transition-colors btn-press"><User size={19} /></Link>
              )}

              {/* Cart */}
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:text-primary transition-colors btn-press">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-border">
                <div className="py-4 flex gap-3">
                  <input type="text" placeholder="Search products…" autoFocus
                    className="flex-1 h-11 px-4 rounded-xl bg-muted font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button onClick={() => setSearchOpen(false)} className="px-4 py-2 rounded-xl border border-border font-body text-sm hover:bg-muted transition-all">
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-card overflow-hidden">
              <nav className="p-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} to={link.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl font-body text-sm transition-all ${location.pathname === link.href ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}>
                    <span className="flex items-center gap-2">
                      {link.label}
                      {link.highlight && hasOffers && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />}
                    </span>
                  </Link>
                ))}
                {customer ? (
                  <>
                    <Link to="/account" className="flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm text-foreground hover:bg-muted"><User size={15} /> Account</Link>
                    <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm text-muted-foreground hover:bg-muted"><LogOut size={15} /> Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 px-4 py-3 rounded-xl font-body text-sm text-foreground hover:bg-muted"><User size={15} /> Login</Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;

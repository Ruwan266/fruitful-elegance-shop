import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User, Heart, ShoppingBag, Menu, X, LogOut, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Build Your Box", href: "/build-your-box" },
  { label: "Corporate", href: "/shop?category=corporate" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { customer, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  // Close notif panel on outside click
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

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href}
                  className={`text-sm font-medium font-body transition-colors hover:text-primary relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left ${location.pathname === link.href ? "text-primary after:scale-x-100" : "text-muted-foreground"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-primary transition-colors btn-press"><Search size={20} /></button>

              {/* Notification Bell (logged-in customers only) */}
              {customer && (
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:text-primary transition-colors btn-press relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-scale-in">{unreadCount}</span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div initial={{ opacity:0, y:-8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-8, scale:0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                          <h3 className="font-body text-sm font-semibold">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="font-body text-xs text-primary hover:underline">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-border">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                              <Bell size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                              <p className="font-body text-xs text-muted-foreground">No notifications yet</p>
                            </div>
                          ) : notifications.map(n => (
                            <button key={n.id} onClick={() => handleNotifClick(n)}
                              className={`w-full text-left p-4 hover:bg-muted/50 transition-all ${!n.is_read ? "bg-primary/3" : ""}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? "bg-primary" : "bg-muted-foreground/30"}`} />
                                <div>
                                  <p className="font-body text-xs font-semibold">{n.title}</p>
                                  {n.body && <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                                  <p className="font-body text-[10px] text-muted-foreground mt-1">
                                    {new Date(n.created_at).toLocaleDateString("en-AE", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="p-3 border-t border-border">
                          <Link to="/account?tab=messages" onClick={() => setNotifOpen(false)} className="block text-center font-body text-xs text-primary hover:underline">
                            View all messages →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Auth-aware user icon */}
              {customer ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/account" className="p-2 hover:text-primary transition-colors flex items-center gap-1.5">
                    <User size={20} />
                    <span className="font-body text-xs font-medium hidden lg:block">{customer.firstName}</span>
                  </Link>
                  <button onClick={logout} className="p-2 hover:text-destructive transition-colors" title="Sign out"><LogOut size={18} /></button>
                </div>
              ) : (
                <Link to="/login" className="p-2 hover:text-primary transition-colors hidden md:block"><User size={20} /></Link>
              )}

              <Link to="#" className="p-2 hover:text-primary transition-colors hidden md:block"><Heart size={20} /></Link>
              <button onClick={() => setIsCartOpen(true)} className="p-2 hover:text-primary transition-colors relative btn-press">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-berry text-berry-foreground rounded-full text-[10px] font-bold flex items-center justify-center animate-scale-in">{totalItems}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg">
              <div className="container-premium py-6">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input type="text" placeholder="Search for fruits, gift boxes, dates..." className="w-full pl-12 pr-4 py-4 bg-muted rounded-2xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" autoFocus />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"><X size={18} /></button>
                </div>
                <div className="mt-4 flex gap-2 justify-center flex-wrap">
                  {["Fresh Fruits","Gift Boxes","Dates","Nuts","Berries"].map(tag => (
                    <Link key={tag} to="/shop" className="badge-pill bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">{tag}</Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="lg:hidden bg-background border-t border-border overflow-hidden">
              <nav className="container-premium py-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} to={link.href} className="block py-3 px-4 text-sm font-medium font-body rounded-xl hover:bg-secondary transition-colors">{link.label}</Link>
                ))}
                <div className="pt-4 border-t border-border flex gap-4">
                  {customer ? (
                    <>
                      <Link to="/account" className="flex items-center gap-2 py-3 px-4 text-sm text-muted-foreground"><User size={18} /> {customer.firstName}</Link>
                      <button onClick={logout} className="flex items-center gap-2 py-3 px-4 text-sm text-muted-foreground"><LogOut size={18} /> Sign Out</button>
                    </>
                  ) : (
                    <Link to="/login" className="flex items-center gap-2 py-3 px-4 text-sm text-muted-foreground"><User size={18} /> Account</Link>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;

import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, Truck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Trust Bar */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-premium py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Truck size={24} className="text-gold" />
              <p className="font-body text-sm font-medium">Free UAE Delivery</p>
              <p className="font-body text-xs text-primary-foreground/60">On orders above AED 200</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <p className="font-body text-sm font-medium">Freshness Guaranteed</p>
              <p className="font-body text-xs text-primary-foreground/60">Hand-picked & quality checked</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <p className="font-body text-sm font-medium">Gift-Ready Packaging</p>
              <p className="font-body text-xs text-primary-foreground/60">Premium luxury presentation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-premium py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div>
              <span className="font-display text-2xl font-semibold">FruitFlix</span>
              <span className="text-xs font-body text-gold font-medium tracking-widest uppercase ml-2">UAE</span>
            </div>
            <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
              Premium fresh fruit gift boxes, luxury dates, artisan nuts and healthy treats. 
              Handcrafted with love, delivered across the UAE.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-foreground transition-all btn-press">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3 font-body text-sm text-primary-foreground/70">
              {["About Us", "Shop All", "Gift Boxes", "Corporate Gifting", "Build Your Box", "Blog"].map(link => (
                <li key={link}><Link to="/shop" className="hover:text-gold transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-lg mb-4">Shop</h4>
            <ul className="space-y-3 font-body text-sm text-primary-foreground/70">
              {["Fresh Fruits", "Premium Nuts", "Luxury Dates", "Fresh Berries", "Healthy Snacks", "Seasonal Collections"].map(link => (
                <li key={link}><Link to="/shop" className="hover:text-gold transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Contact</h4>
            <ul className="space-y-3 font-body text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><MapPin size={16} className="text-gold flex-shrink-0" /> Dubai, Abu Dhabi & Sharjah, UAE</li>
              <li className="flex items-center gap-2"><Phone size={16} className="text-gold flex-shrink-0" /> +971 50 123 4567</li>
              <li className="flex items-center gap-2"><Mail size={16} className="text-gold flex-shrink-0" /> hello@fruitflix.ae</li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2.5 rounded-full bg-primary-foreground/10 text-sm font-body placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
                <button className="px-5 py-2.5 bg-gold text-foreground rounded-full text-sm font-medium hover:brightness-110 transition-all btn-press">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-premium py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-primary-foreground/50">
            © 2026 FruitFlix UAE. All rights reserved.
          </p>
          <div className="flex items-center gap-4 font-body text-xs text-primary-foreground/50">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Float */}
      <a
        href="https://wa.me/971501234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[hsl(142,70%,41%)] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform btn-press"
        aria-label="WhatsApp Support"
      >
        <svg className="w-7 h-7 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </footer>
  );
};

export default Footer;

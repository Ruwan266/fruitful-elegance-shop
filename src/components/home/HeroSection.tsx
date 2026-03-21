import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import heroImg from "@/assets/hero-giftbox.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[85vh] py-16 lg:py-0">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="space-y-8 text-center lg:text-left"
          >
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block font-body text-xs tracking-[0.2em] uppercase text-gold font-medium mb-4"
              >
                Premium Gifting · UAE
              </motion.span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-[1.1] text-foreground">
                Nature's Finest,{" "}
                <span className="text-gradient-gold">Wrapped</span>{" "}
                for Them
              </h1>
            </div>
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Hand-picked premium fruits, luxury dates, and artisan nut collections. 
              Beautifully gift-wrapped and delivered fresh across the UAE.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link
                to="/shop"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold flex items-center gap-2 hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20"
              >
                Shop Gift Boxes
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/build-your-box"
                className="px-8 py-4 border-2 border-foreground/10 text-foreground rounded-full font-body text-sm font-semibold flex items-center gap-2 hover:border-primary hover:text-primary transition-all btn-press"
              >
                Build Your Box
              </Link>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">10K+</p>
                <p className="font-body text-xs text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">4.9★</p>
                <p className="font-body text-xs text-muted-foreground">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">24h</p>
                <p className="font-body text-xs text-muted-foreground">UAE Delivery</p>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <img
                src={heroImg}
                alt="Premium fruit gift box by FruitFlix UAE"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            {/* Floating badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 md:left-8 glass rounded-2xl p-4 shadow-lg"
            >
              <p className="font-body text-xs text-muted-foreground">Free Delivery</p>
              <p className="font-display text-lg font-semibold">Across UAE 🇦🇪</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

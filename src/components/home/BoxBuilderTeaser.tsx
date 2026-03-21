import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, Palette, ArrowRight } from "lucide-react";
import giftboxImg from "@/assets/giftbox-collection.jpg";

const BoxBuilderTeaser = () => {
  return (
    <section className="section-spacing bg-background">
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Personalize</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              Build Your Own<br />
              <span className="text-gradient-gold">Dream Box</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed max-w-md">
              Choose your box size, pick your favourite fruits, nuts, and dates. 
              Watch your custom gift box come to life with our interactive builder.
            </p>
            <div className="space-y-3">
              {[
                { icon: Package, text: "Choose your premium box size (S / M / L)" },
                { icon: Palette, text: "Pick from beautiful color options" },
                { icon: Package, text: "Fill with your favourite items" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 font-body text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon size={16} className="text-primary" />
                  </div>
                  {step.text}
                </div>
              ))}
            </div>
            <Link
              to="/build-your-box"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press shadow-lg shadow-primary/20"
            >
              Start Building <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-square">
              <img src={giftboxImg} alt="Build your own gift box" className="w-full h-full object-cover" />
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass rounded-2xl p-4 shadow-lg"
            >
              <p className="font-display text-2xl">🎁</p>
              <p className="font-body text-xs font-medium">From AED 99</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BoxBuilderTeaser;

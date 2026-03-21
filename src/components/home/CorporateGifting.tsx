import { motion } from "framer-motion";
import corporateImg from "@/assets/corporate-gifting.jpg";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CorporateGifting = () => {
  return (
    <section className="section-spacing bg-primary text-primary-foreground overflow-hidden">
      <div className="container-premium">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">For Business</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              Elevate Your Corporate Gifting
            </h2>
            <p className="font-body text-primary-foreground/70 leading-relaxed">
              Impress clients and reward your team with premium, customizable gift hampers. 
              Branded packaging, bulk ordering, and dedicated account management available.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {["Custom Branding", "Bulk Orders", "Dedicated Support", "Premium Wrapping"].map((f, i) => (
                <div key={i} className="flex items-center gap-2 font-body text-sm text-primary-foreground/80">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  {f}
                </div>
              ))}
            </div>
            <Link
              to="/shop?category=corporate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-foreground rounded-full font-body text-sm font-semibold hover:brightness-110 transition-all btn-press"
            >
              Enquire Now <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl"
          >
            <img src={corporateImg} alt="Corporate gifting" className="w-full h-full object-cover aspect-[4/3]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CorporateGifting;

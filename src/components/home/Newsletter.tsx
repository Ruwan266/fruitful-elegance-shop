import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  return (
    <section className="section-spacing bg-background">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-6"
        >
          <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Stay Fresh</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">
            Join Our Community
          </h2>
          <p className="font-body text-muted-foreground">
            Be the first to know about seasonal collections, exclusive offers, and gifting inspiration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-muted rounded-full font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-body text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all btn-press">
              Subscribe <ArrowRight size={16} />
            </button>
          </div>
          <p className="font-body text-xs text-muted-foreground">No spam, unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;

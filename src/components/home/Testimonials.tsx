import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Fatima Al-Rashid",
    role: "Dubai, UAE",
    text: "The most beautiful fruit gift box I've ever ordered. My mother was so happy! The quality is exceptional and the presentation is truly luxury.",
    rating: 5,
  },
  {
    name: "Ahmed Hassan",
    role: "Abu Dhabi, UAE",
    text: "We ordered 50 corporate gift boxes for Eid and FruitFlix delivered perfection. Our clients were impressed. Will definitely order again.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Sharjah, UAE",
    text: "Fresh, premium, and beautifully packaged. The dates and nuts selection was outstanding. Same-day delivery too! Absolutely recommend.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="section-spacing bg-secondary/30">
      <div className="container-premium">
        <div className="text-center mb-12">
          <span className="font-body text-xs tracking-[0.2em] uppercase text-gold font-medium">Testimonials</span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mt-2">Loved by Thousands</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="card-premium p-8 space-y-4"
            >
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
              <div>
                <p className="font-body text-sm font-semibold">{t.name}</p>
                <p className="font-body text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

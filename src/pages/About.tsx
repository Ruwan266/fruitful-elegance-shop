import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Leaf, Heart, Award, Globe } from "lucide-react";

const values = [
  { icon: Leaf, title: "Fresh & Natural", description: "We source the finest fruits and nuts from trusted farms across the globe." },
  { icon: Heart, title: "Crafted with Love", description: "Every gift box is hand-assembled with care and attention to detail." },
  { icon: Award, title: "Premium Quality", description: "Only the highest quality products make it into our curated collections." },
  { icon: Globe, title: "UAE Heritage", description: "Proudly serving the UAE with a blend of tradition and modern gifting." },
];

const About = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">FruitFlix</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              Born in the heart of the UAE, FruitFlix is a premium gifting brand dedicated to
              delivering nature's finest — from hand-picked fresh fruits and exotic dates to
              artisan nut collections and luxurious gift boxes. We believe every occasion
              deserves a gift that's as memorable as it is delicious.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {values.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-8 text-center border border-border hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="text-primary" size={26} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground font-body text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-primary/5 rounded-3xl p-10 md:p-16 text-center"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground font-body text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              To redefine gifting in the UAE by offering premium, beautifully curated
              fruit and nut collections that bring joy to every celebration — from corporate
              events to intimate family gatherings.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+971 4 123 4567" },
  { icon: Mail, label: "Email", value: "hello@fruitflix.ae" },
  { icon: MapPin, label: "Address", value: "Dubai, United Arab Emirates" },
  { icon: Clock, label: "Hours", value: "Sun–Thu: 9AM–6PM" },
];

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
              Have a question or want to place a bulk order? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-5 bg-card rounded-2xl border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="text-primary" size={22} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-muted-foreground font-body text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {submitted ? (
                <div className="bg-primary/5 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Send className="text-primary" size={28} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground font-body text-sm">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground font-body mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground font-body mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground font-body mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                      placeholder="How can we help?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-body font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;

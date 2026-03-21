import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Leaf, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const passing = passwordRules.every(r => r.test(form.password));
    if (!passing) {
      toast({ title: "Weak password", description: "Please meet all password requirements.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone || undefined });
      toast({ title: "Account created!", description: "Welcome to FruitFlix UAE." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Could not create account.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative w-full max-w-md">
        <div className="relative rounded-3xl p-[1px]" style={{ background: "linear-gradient(145deg, hsl(var(--primary) / 0.25), hsl(var(--gold) / 0.2), hsl(var(--border)))" }}>
          <div className="rounded-3xl bg-card/95 backdrop-blur-xl p-8 sm:p-10" style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Create Account</h1>
              <p className="text-muted-foreground mt-2 text-sm">Join the FruitFlix family today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-foreground/80 text-sm font-medium mb-1.5 block">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="firstName" type="text" placeholder="John" value={form.firstName} onChange={update("firstName")} required className="pl-10 h-12 rounded-xl border-border/60 bg-background/60" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-foreground/80 text-sm font-medium mb-1.5 block">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="lastName" type="text" placeholder="Doe" value={form.lastName} onChange={update("lastName")} required className="pl-10 h-12 rounded-xl border-border/60 bg-background/60" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground/80 text-sm font-medium mb-1.5 block">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} required className="pl-10 h-12 rounded-xl border-border/60 bg-background/60" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-foreground/80 text-sm font-medium mb-1.5 block">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" placeholder="+971 50 000 0000" value={form.phone} onChange={update("phone")} className="pl-10 h-12 rounded-xl border-border/60 bg-background/60" />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground/80 text-sm font-medium mb-1.5 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={form.password} onChange={update("password")} required className="pl-10 pr-10 h-12 rounded-xl border-border/60 bg-background/60" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="mt-2 space-y-1">
                    {passwordRules.map(rule => (
                      <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                        <Check className={`w-3 h-3 ${rule.test(form.password) ? "text-primary" : "text-muted-foreground/40"}`} />
                        <span className={rule.test(form.password) ? "text-primary" : "text-muted-foreground/60"}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-sm font-semibold group btn-press" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(114 37% 20%))", boxShadow: "0 8px 24px -6px hsl(var(--primary) / 0.35)" }}>
                {loading ? "Creating account…" : <><span>Create Account</span> <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </form>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:text-primary/80">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
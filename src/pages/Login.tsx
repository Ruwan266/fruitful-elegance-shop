import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back!", description: "You are now signed in." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message || "Invalid email or password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative w-full max-w-md">
        <div className="relative rounded-3xl p-[1px]" style={{ background: "linear-gradient(145deg, hsl(var(--gold) / 0.3), hsl(var(--primary) / 0.15), hsl(var(--border)))" }}>
          <div className="rounded-3xl bg-card/95 backdrop-blur-xl p-8 sm:p-10" style={{ boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Welcome Back</h1>
              <p className="text-muted-foreground mt-2 text-sm">Sign in to your FruitFlix account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-foreground/80 text-sm font-medium mb-1.5 block">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 h-12 rounded-xl border-border/60 bg-background/60" />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground/80 text-sm font-medium mb-1.5 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 pr-10 h-12 rounded-xl border-border/60 bg-background/60" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-sm font-semibold group btn-press" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(114 37% 20%))", boxShadow: "0 8px 24px -6px hsl(var(--primary) / 0.35)" }}>
                {loading ? "Signing in…" : <><span>Sign In</span> <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            </form>

            <p className="text-center mt-8 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:text-primary/80">Create Account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
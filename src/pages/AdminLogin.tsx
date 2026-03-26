import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminLogin } from "@/lib/admin";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { authenticated, signIn, loading } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && authenticated) {
      navigate("/admin", { replace: true });
    }
  }, [loading, authenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    setSubmitting(true);
    try {
      const data = await adminLogin(username.trim(), password);
      signIn(data.token);
      toast.success("Welcome, admin");
      navigate("/admin", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Invalid admin credentials");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="FeePilot" className="w-10 h-10 object-contain" />
            <span className="font-display font-bold text-2xl text-foreground">FeePilot</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Secure access to platform controls</p>
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin@feepilot"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90"
            >
              {submitting ? "Please wait..." : "Log In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

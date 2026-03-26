import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, CreditCard, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function isValidUpiId(upi: string): boolean {
  return /^[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}$/.test(upi);
}

function getTrialDaysLeft(trialEnd: string | null): number | null {
  if (!trialEnd) return null;
  const diff = new Date(trialEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const SettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: "",
    upi_id: "",
    whatsapp_name: "",
    phone: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        upi_id: profile.upi_id || "",
        whatsapp_name: profile.whatsapp_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          upi_id: form.upi_id.trim(),
          whatsapp_name: form.whatsapp_name.trim(),
          phone: form.phone.replace(/\D/g, ""),
        })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings saved successfully!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSave = () => {
    if (!form.upi_id.trim()) {
      toast.error("UPI ID is required for payment collection");
      return;
    }
    if (!isValidUpiId(form.upi_id.trim())) {
      toast.error("Invalid UPI ID format. Example: yourname@upi or name@oksbi");
      return;
    }
    saveMutation.mutate();
  };

  const trialDays = getTrialDaysLeft(profile?.trial_end || null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <User size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Profile</h2>
              <p className="text-xs text-muted-foreground">Your personal information</p>
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                placeholder="e.g. Rajesh Sharma"
                value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Phone Number</Label>
              <Input
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                className="mt-1.5"
                maxLength={10}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">WhatsApp Display Name</Label>
              <Input
                placeholder="e.g. Sharma Coaching"
                value={form.whatsapp_name}
                onChange={(e) => setForm((p) => ({ ...p, whatsapp_name: e.target.value }))}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">This name appears in WhatsApp messages to parents.</p>
            </div>
          </div>
        </div>

        {/* UPI */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <CreditCard size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Payment Settings</h2>
              <p className="text-xs text-muted-foreground">Configure your UPI for receiving payments</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">UPI ID <span className="text-destructive">*</span></Label>
            <Input
              placeholder="e.g. yourname@upi or name@oksbi"
              value={form.upi_id}
              onChange={(e) => setForm((p) => ({ ...p, upi_id: e.target.value }))}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: <span className="font-mono text-foreground/70">name@bankcode</span> — e.g. sharma@oksbi, rajesh@paytm, 9876543210@ybl
            </p>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Crown size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-foreground">Subscription</h2>
              <p className="text-xs text-muted-foreground">Your current plan and billing</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 capitalize">
              {profile?.plan || "trial"}
            </Badge>
            {profile?.plan === "trial" && trialDays !== null && (
              <p className="text-sm text-muted-foreground">
                {trialDays > 0
                  ? `${trialDays} day${trialDays !== 1 ? "s" : ""} left in trial`
                  : "Trial expired"}
              </p>
            )}
            {profile?.plan !== "trial" && (
              <p className="text-sm text-muted-foreground">Active</p>
            )}
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            Upgrade Plan
          </Button>
        </div>

        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90"
        >
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

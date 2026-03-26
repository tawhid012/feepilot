import { motion } from "framer-motion";
import { Users, IndianRupee, Clock, Send } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const DashboardHome = () => {
  const { user } = useAuth();

  const currentMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", currentMonth],
    queryFn: async () => {
      const [studentsRes, allPaymentsRes, monthPaymentsRes] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount, status"),
        supabase.from("payments").select("amount, status").eq("month", currentMonth),
      ]);

      const totalStudents = studentsRes.count || 0;
      const allPayments = allPaymentsRes.data || [];
      const monthPayments = monthPaymentsRes.data || [];

      const totalCollected = allPayments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const totalPending = allPayments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const monthCollected = monthPayments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const monthPending = monthPayments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount), 0);

      return { totalStudents, totalCollected, totalPending, monthCollected, monthPending };
    },
    enabled: !!user,
  });

  const { data: recentPayments = [] } = useQuery({
    queryKey: ["recent-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, students(student_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const statCards = [
    { label: "Total Students", value: String(stats?.totalStudents || 0), icon: Users },
    { label: "Total Collected", value: `₹${(stats?.totalCollected || 0).toLocaleString("en-IN")}`, icon: IndianRupee },
    { label: "Pending Amount", value: `₹${(stats?.totalPending || 0).toLocaleString("en-IN")}`, icon: Clock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-5 shadow-card border border-border animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-muted mb-3" />
                <div className="h-7 w-24 bg-muted rounded mb-1" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-5 shadow-card border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <s.icon size={20} className="text-primary" />
                  </div>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* This Month Summary */}
        {stats && (stats.monthCollected > 0 || stats.monthPending > 0) && (
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
            <h2 className="font-display font-semibold text-foreground mb-3">This Month ({currentMonth})</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Collected</p>
                <p className="font-display text-lg font-bold text-primary">₹{stats.monthCollected.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-accent/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="font-display text-lg font-bold text-foreground">₹{stats.monthPending.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-display font-semibold text-foreground mb-4">Recent Activity</h2>
          {recentPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No activity yet</p>
              <p className="text-xs text-muted-foreground">
                Add students and generate monthly payments to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === "paid" ? "bg-primary" : "bg-muted-foreground"}`} />
                  <p className="text-sm text-foreground flex-1 min-w-0 truncate">
                    {p.students?.student_name || "Student"} — ₹{Number(p.amount).toLocaleString("en-IN")} ({p.month})
                  </p>
                  <span className={`text-xs font-medium flex-shrink-0 ${p.status === "paid" ? "text-primary" : "text-muted-foreground"}`}>
                    {p.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;

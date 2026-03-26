import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Clock, MessageSquare, CalendarPlus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { generateUPILink, generatePaymentMessage, generateReceiptMessage } from "@/services/upiService";
import { openWhatsApp } from "@/services/whatsappService";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PaymentWithStudent {
  id: string;
  user_id: string;
  student_id: string;
  month: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  students: { student_name: string; parent_phone: string } | null;
}

const PaymentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [markPaidTarget, setMarkPaidTarget] = useState<PaymentWithStudent | null>(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, students(student_name, parent_phone)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PaymentWithStudent[];
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
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

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payments")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Payment marked as paid!");
      setMarkPaidTarget(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSendReminder = async (payment: PaymentWithStudent) => {
    const upiId = profile?.upi_id;
    if (!upiId) {
      toast.error("Please set your UPI ID in Settings first");
      return;
    }
    const studentName = payment.students?.student_name || "Student";
    const phone = payment.students?.parent_phone || "";
    const tutorName = profile?.whatsapp_name || profile?.full_name || "Tutor";

    const upiLink = generateUPILink({
      payeeVPA: upiId,
      payeeName: tutorName,
      amount: payment.amount,
      transactionNote: `Fee for ${payment.month}`,
    });
    const message = generatePaymentMessage(studentName, payment.amount, upiLink, tutorName);

    await supabase.from("messages").insert({
      user_id: user!.id,
      student_id: payment.student_id,
      message_type: "reminder",
      content: message,
    });

    openWhatsApp(phone, message);
    toast.success("Opening WhatsApp with reminder...");
  };

  const handleSendReceipt = async (payment: PaymentWithStudent) => {
    const studentName = payment.students?.student_name || "Student";
    const phone = payment.students?.parent_phone || "";
    const tutorName = profile?.whatsapp_name || profile?.full_name || "Tutor";

    const message = generateReceiptMessage(studentName, payment.amount, payment.month, tutorName);

    await supabase.from("messages").insert({
      user_id: user!.id,
      student_id: payment.student_id,
      message_type: "receipt",
      content: message,
    });

    openWhatsApp(phone, message);
    toast.success("Opening WhatsApp with receipt...");
  };

  const handleGenerateMonthly = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const { data: students, error: sErr } = await supabase
        .from("students")
        .select("id, fee_amount");
      if (sErr) throw sErr;
      if (!students || students.length === 0) {
        toast.error("No students found. Add students first.");
        setGenerating(false);
        return;
      }

      const { data: existing } = await supabase
        .from("payments")
        .select("student_id")
        .eq("month", month);
      const existingIds = new Set((existing || []).map((p) => p.student_id));

      const newPayments = students
        .filter((s) => !existingIds.has(s.id))
        .map((s) => ({
          user_id: user!.id,
          student_id: s.id,
          month,
          amount: s.fee_amount,
          status: "pending" as const,
        }));

      if (newPayments.length === 0) {
        toast.info("All payment records already exist for this month.");
        setGenerating(false);
        return;
      }

      const { error } = await supabase.from("payments").insert(newPayments);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(`Created ${newPayments.length} payment records for ${month}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-sm text-muted-foreground">Track and manage fee payments</p>
          </div>
          <Button
            onClick={handleGenerateMonthly}
            disabled={generating}
            className="gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90"
          >
            <CalendarPlus size={16} className="mr-2" />
            {generating ? "Generating..." : "Generate This Month"}
          </Button>
        </div>

        {isLoading ? (
          <div className="bg-card rounded-2xl p-12 shadow-card border border-border text-center">
            <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 shadow-card border border-border text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={24} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No payments yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Add students first, then click "Generate This Month" to create payment records.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{p.students?.student_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.month}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        {p.status === "paid" ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                            <CheckCircle size={12} className="mr-1" /> Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Clock size={12} className="mr-1" /> Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "pending" ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => handleSendReminder(p)} className="text-xs">
                                <Send size={12} className="mr-1" /> Remind
                              </Button>
                              <Button size="sm" onClick={() => setMarkPaidTarget(p)} className="text-xs gradient-primary text-primary-foreground border-0">
                                Mark Paid
                              </Button>
                            </>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleSendReceipt(p)} className="text-xs">
                              <Send size={12} className="mr-1" /> Receipt
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Mark Paid Confirmation */}
      <AlertDialog open={!!markPaidTarget} onOpenChange={(open) => !open && setMarkPaidTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm that <strong>{markPaidTarget?.students?.student_name}</strong> has paid ₹{markPaidTarget ? Number(markPaidTarget.amount).toLocaleString("en-IN") : ""} for {markPaidTarget?.month}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => markPaidTarget && markPaidMutation.mutate(markPaidTarget.id)}
              className="gradient-primary text-primary-foreground border-0"
            >
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PaymentsPage;

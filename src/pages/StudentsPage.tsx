import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Student } from "@/types";

const StudentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: "", parent_phone: "", fee_amount: "" });
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (values: { student_name: string; parent_phone: string; fee_amount: number }) => {
      const { error } = await supabase.from("students").insert({
        user_id: user!.id,
        student_name: values.student_name,
        parent_phone: values.parent_phone,
        fee_amount: values.fee_amount,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student added successfully!");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: { id: string; student_name: string; parent_phone: string; fee_amount: number }) => {
      const { error } = await supabase.from("students").update({
        student_name: values.student_name,
        parent_phone: values.parent_phone,
        fee_amount: values.fee_amount,
      }).eq("id", values.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student updated successfully!");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student removed successfully!");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = students.filter(
    (s) =>
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.parent_phone.includes(search)
  );

  const handleSave = () => {
    if (!form.name.trim() || !form.parent_phone.trim() || !form.fee_amount) {
      toast.error("Please fill all fields");
      return;
    }
    const phone = form.parent_phone.replace(/\D/g, "");
    if (phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        student_name: form.name.trim(),
        parent_phone: phone,
        fee_amount: Number(form.fee_amount),
      });
    } else {
      addMutation.mutate({
        student_name: form.name.trim(),
        parent_phone: phone,
        fee_amount: Number(form.fee_amount),
      });
    }
  };

  const resetForm = () => {
    setForm({ name: "", parent_phone: "", fee_amount: "" });
    setEditingStudent(null);
    setDialogOpen(false);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ name: s.student_name, parent_phone: s.parent_phone, fee_amount: String(s.fee_amount) });
    setDialogOpen(true);
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground">{students.length} student{students.length !== 1 ? "s" : ""}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90">
                <Plus size={16} className="mr-2" /> Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">{editingStudent ? "Edit Student" : "Add Student"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label className="text-sm font-medium">Student Name</Label>
                  <Input
                    placeholder="e.g. Aarav Patel"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Parent Phone</Label>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={form.parent_phone}
                    onChange={(e) => setForm((f) => ({ ...f, parent_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                    className="mt-1.5"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground mt-1">10-digit Indian mobile number</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monthly Fee (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 2500"
                    value={form.fee_amount}
                    onChange={(e) => setForm((f) => ({ ...f, fee_amount: e.target.value }))}
                    className="mt-1.5"
                    min={0}
                  />
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="w-full gradient-primary text-primary-foreground border-0 shadow-elevated hover:opacity-90">
                  {isSaving ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="bg-card rounded-2xl p-12 shadow-card border border-border text-center">
            <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 shadow-card border border-border text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No students yet</p>
            <p className="text-xs text-muted-foreground mb-4">Add your first student to get started.</p>
            <Button onClick={() => setDialogOpen(true)} variant="outline" size="sm">
              <Plus size={14} className="mr-1" /> Add Student
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fee</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{s.student_name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">+91 {s.parent_phone}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">₹{Number(s.fee_amount).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                            <Pencil size={14} className="text-muted-foreground" />
                          </button>
                          <button onClick={() => setDeleteTarget(s)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                            <Trash2 size={14} className="text-destructive" />
                          </button>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.student_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default StudentsPage;

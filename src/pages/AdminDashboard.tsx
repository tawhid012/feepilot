import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, IndianRupee, CreditCard, GraduationCap, Search, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminFetch } from "@/lib/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface AdminUser {
  user_id: string;
  full_name: string;
  phone: string;
  upi_id: string;
  plan: "trial" | "monthly" | "lifetime";
  trial_end: string | null;
  created_at: string;
  students_count: number;
  payments_count: number;
  total_collected: number;
  total_pending: number;
}

const planLabel: Record<AdminUser["plan"], string> = {
  trial: "Trial",
  monthly: "Premium",
  lifetime: "Lifetime",
};

const AdminDashboard = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", upi_id: "", plan: "trial" });
  const queryClient = useQueryClient();

  const activeTab = params.get("tab") || "overview";

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminFetch<{
      overview: {
        totalUsers: number;
        totalStudents: number;
        totalPayments: number;
        totalRevenue: number;
      };
      users: AdminUser[];
      activity: Array<{ type: string; user_name: string; detail: string; at: string }>;
      subscriptions: { trial: number; paid: number; expired: number };
    }>({ action: "dashboard" }),
  });

  const userDetailQuery = useQuery({
    queryKey: ["admin-user-detail", viewUserId],
    queryFn: () => adminFetch<{ user: AdminUser; students: any[]; payments: any[] }>({ action: "user_detail", userId: viewUserId }),
    enabled: !!viewUserId,
  });

  const filteredUsers = useMemo(() => {
    const users = data?.users || [];
    const q = search.toLowerCase();
    return users.filter((u) => u.full_name.toLowerCase().includes(q) || u.phone.includes(search) || u.upi_id.toLowerCase().includes(q));
  }, [data?.users, search]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminFetch({
        action: "update_user",
        userId: editingUser?.user_id,
        ...editForm,
      }),
    onSuccess: () => {
      toast.success("User updated");
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminFetch({ action: "delete_user", userId: deleteUser?.user_id }),
    onSuccess: () => {
      toast.success("User deleted");
      setDeleteUser(null);
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name,
      phone: user.phone,
      upi_id: user.upi_id,
      plan: user.plan,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor platform usage and tutor activity.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card rounded-2xl p-12 shadow-card border border-border text-center">
            <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse mx-auto" />
            <p className="text-sm text-muted-foreground mt-4">Loading admin data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={String(data?.overview.totalUsers || 0)} icon={Users} />
              <StatCard label="Total Students" value={String(data?.overview.totalStudents || 0)} icon={GraduationCap} />
              <StatCard label="Total Payments" value={String(data?.overview.totalPayments || 0)} icon={CreditCard} />
              <StatCard label="Total Revenue" value={`₹${(data?.overview.totalRevenue || 0).toLocaleString("en-IN")}`} icon={IndianRupee} />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant={activeTab === "overview" ? "default" : "outline"} onClick={() => setParams({})}>Overview</Button>
              <Button variant={activeTab === "users" ? "default" : "outline"} onClick={() => setParams({ tab: "users" })}>Users</Button>
              <Button variant={activeTab === "activity" ? "default" : "outline"} onClick={() => setParams({ tab: "activity" })}>Activity</Button>
            </div>

            {activeTab === "activity" ? (
              <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.activity || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">{item.type}</td>
                        <td className="px-4 py-3 text-sm">{item.user_name}</td>
                        <td className="px-4 py-3 text-sm">{item.detail}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(item.at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-card rounded-2xl p-4 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Trial users: <strong>{data?.subscriptions.trial || 0}</strong> | Paid users: <strong>{data?.subscriptions.paid || 0}</strong> | Expired users: <strong>{data?.subscriptions.expired || 0}</strong>
                  </p>
                </div>
                <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tutor Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">UPI ID</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trial Expiry</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="px-4 py-3 text-sm font-medium">{u.full_name || "—"}</td>
                            <td className="px-4 py-3 text-sm">{u.phone || "—"}</td>
                            <td className="px-4 py-3 text-sm">{u.upi_id || "—"}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge variant="outline">{planLabel[u.plan]}</Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{u.trial_end ? new Date(u.trial_end).toLocaleDateString() : "—"}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => setViewUserId(u.user_id)}><Eye size={14} /></Button>
                                <Button size="sm" variant="outline" onClick={() => openEdit(u)}><Pencil size={14} /></Button>
                                <Button size="sm" variant="outline" onClick={() => setDeleteUser(u)}><Trash2 size={14} className="text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!viewUserId} onOpenChange={(open) => !open && setViewUserId(null)}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total Collected: ₹{Number(userDetailQuery.data?.user.total_collected || 0).toLocaleString("en-IN")} | Pending: ₹{Number(userDetailQuery.data?.user.total_pending || 0).toLocaleString("en-IN")}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-3">
                <h3 className="font-medium mb-2">Students</h3>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {(userDetailQuery.data?.students || []).map((s: any) => (
                    <div key={s.id} className="text-sm border-b border-border pb-2">
                      {s.student_name} - +91 {s.parent_phone}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <h3 className="font-medium mb-2">Payments</h3>
                <div className="space-y-2 max-h-56 overflow-auto">
                  {(userDetailQuery.data?.payments || []).map((p: any) => (
                    <div key={p.id} className="text-sm border-b border-border pb-2">
                      {p.month} - ₹{Number(p.amount).toLocaleString("en-IN")} ({p.status})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Full Name</Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
            </div>
            <div>
              <Label>UPI ID</Label>
              <Input value={editForm.upi_id} onChange={(e) => setEditForm((f) => ({ ...f, upi_id: e.target.value }))} />
            </div>
            <div>
              <Label>Plan</Label>
              <select
                className="w-full border border-border bg-background h-10 rounded-md px-3 text-sm"
                value={editForm.plan}
                onChange={(e) => setEditForm((f) => ({ ...f, plan: e.target.value }))}
              >
                <option value="trial">Trial</option>
                <option value="monthly">Premium</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="w-full gradient-primary text-primary-foreground border-0">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Delete this tutor account and all related students, payments, and messages?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
        <Icon size={20} className="text-primary" />
      </div>
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default AdminDashboard;

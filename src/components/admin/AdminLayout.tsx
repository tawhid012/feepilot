import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Activity, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import logo from "@/assets/logo.png";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin?tab=users", icon: Users },
  { title: "Activity", url: "/admin?tab=activity", icon: Activity },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    toast.success("Admin logged out");
    navigate("/admin-login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="FeePilot" className="w-8 h-8 object-contain flex-shrink-0" />
          {!collapsed && <span className="font-display font-bold text-lg text-sidebar-foreground">FeePilot Admin</span>}
        </Link>
      </div>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon size={18} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut size={18} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-4 border-b border-border px-4 bg-card">
            <SidebarTrigger />
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground hidden sm:block">Admin Console</span>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">A</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto bg-muted/30">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

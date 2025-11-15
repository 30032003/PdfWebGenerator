import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserNavbar } from "@/components/UserNavbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getAuthUser } from "@/lib/auth";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminStores from "@/pages/admin/AdminStores";
import Stores from "@/pages/Stores";
import ChangePassword from "@/pages/ChangePassword";
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import NotFound from "@/pages/not-found";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <UserNavbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function RootRedirect() {
  const user = getAuthUser();

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.role === "admin") {
    return <Redirect to="/admin/dashboard" />;
  } else if (user.role === "store_owner") {
    return <Redirect to="/owner/dashboard" />;
  } else {
    return <Redirect to="/stores" />;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      <Route path="/admin/dashboard">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/stores">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout>
            <AdminStores />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/stores">
        <ProtectedRoute allowedRoles={["user"]}>
          <UserLayout>
            <Stores />
          </UserLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/change-password">
        <ProtectedRoute allowedRoles={["user", "store_owner"]}>
          <UserLayout>
            <ChangePassword />
          </UserLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/owner/dashboard">
        <ProtectedRoute allowedRoles={["store_owner"]}>
          <UserLayout>
            <OwnerDashboard />
          </UserLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Purchase from "@/pages/purchase";
import Withdraw from "@/pages/withdraw";
import Transactions from "@/pages/transactions";
import Sponsor from "@/pages/sponsor";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminUserDetail from "@/pages/admin/user-detail";
import AdminPurchases from "@/pages/admin/purchases";
import AdminWithdrawals from "@/pages/admin/withdrawals";
import AdminSettings from "@/pages/admin/settings";
import AdminSponsor from "@/pages/admin/sponsor";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, requireAdmin }: { component: any, requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
    if (!isLoading && isAuthenticated && requireAdmin && !user?.is_admin) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, requireAdmin, user, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !user?.is_admin) {
    return null;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin Routes (checked before user root) */}
      <Route path="/admin/users/:id">
        <ProtectedRoute component={AdminUserDetail} requireAdmin={true} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} requireAdmin={true} />
      </Route>
      <Route path="/admin/purchases">
        <ProtectedRoute component={AdminPurchases} requireAdmin={true} />
      </Route>
      <Route path="/admin/withdrawals">
        <ProtectedRoute component={AdminWithdrawals} requireAdmin={true} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute component={AdminSettings} requireAdmin={true} />
      </Route>
      <Route path="/admin/sponsor">
        <ProtectedRoute component={AdminSponsor} requireAdmin={true} />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} requireAdmin={true} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} requireAdmin={true} />
      </Route>

      {/* Protected User Routes */}
      <Route path="/purchase">
        <ProtectedRoute component={Purchase} />
      </Route>
      <Route path="/user/dashboard/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/user/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/user/dashbord/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/user/dashbord">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/withdraw">
        <ProtectedRoute component={Withdraw} />
      </Route>
      <Route path="/transactions">
        <ProtectedRoute component={Transactions} />
      </Route>
      <Route path="/sponsor">
        <ProtectedRoute component={Sponsor} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>

      {/* Catch all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
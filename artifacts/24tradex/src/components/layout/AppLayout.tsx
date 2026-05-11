import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowDownToLine, 
  History, 
  Users, 
  UserCircle, 
  Settings, 
  LogOut,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  adminOnly?: boolean;
}

const items: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShoppingCart, label: "Purchase", href: "/purchase" },
  { icon: ArrowDownToLine, label: "Withdraw", href: "/withdraw" },
  { icon: History, label: "Transactions", href: "/transactions" },
  { icon: Users, label: "Sponsor", href: "/sponsor" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminItems: SidebarItem[] = [
  { icon: ShieldAlert, label: "Admin Dashboard", href: "/admin", adminOnly: true },
  { icon: Users, label: "Users", href: "/admin/users", adminOnly: true },
  { icon: ShoppingCart, label: "Purchases", href: "/admin/purchases", adminOnly: true },
  { icon: ArrowDownToLine, label: "Withdrawals", href: "/admin/withdrawals", adminOnly: true },
  { icon: Settings, label: "System Settings", href: "/admin/settings", adminOnly: true },
  { icon: Users, label: "Sponsor Relations", href: "/admin/sponsor", adminOnly: true },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const allItems = user?.is_admin ? [...items, ...adminItems] : items;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-white/10 glass-panel">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          24TradeX
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {allItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all cursor-pointer text-sm",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-white/10 glass-panel flex items-center px-6 sticky top-0 z-10">
           <div className="md:hidden text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              24TradeX
           </div>
           <div className="ml-auto flex items-center gap-4">
              {/* User menu or notifications can go here */}
           </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-0">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

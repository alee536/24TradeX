import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Settings,
  LogOut,
  ShieldAlert,
  Home,
  LayoutDashboard,
  ShoppingCart,
  ArrowDownToLine,
  History,
  Users,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/social-links";
import { Logo } from "../ui/logo";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  adminOnly?: boolean;
}

const items: SidebarItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutDashboard, label: "Dashboard", href: "/user/dashboard" },
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
    <aside
      className="w-64 shrink-0 flex flex-col sticky top-0 h-dvh"
      style={{
        background: "linear-gradient(180deg, #060c18 0%, #070e1c 100%)",
        borderRight: "1px solid rgba(59,130,246,0.1)",
      }}
    >
      <div className="flex flex-col gap-3 px-4 py-4" style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
        <div className="flex items-center gap-3">
          <Logo size="md" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {allItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200",
                location === item.href
                  ? "bg-white/10 text-white"
                  : "text-gray-200 hover:bg-white/10"
              )}
            >
              <item.icon className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-blue-500/20 text-blue-300">
              {user.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.is_admin ? "Administrator" : "Trader"}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm text-gray-300 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: "#070d1a" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Global footer with social links */}
        <footer className="shrink-0 p-4 border-t border-white/5 bg-transparent">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-400">
            <span>© {new Date().getFullYear()} 24TRADEX</span>
            <div className="flex items-center gap-4">
              <SocialLinks />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

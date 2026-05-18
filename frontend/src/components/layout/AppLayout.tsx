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
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CryptoBackground } from "@/components/ui/crypto-background";
import { Logo } from "@/components/ui/logo";
import { SocialLinks } from "@/components/ui/social-links";

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
    <aside
      className="w-64 shrink-0 hidden md:flex flex-col"
      style={{
        background: "linear-gradient(180deg, #060c18 0%, #070e1c 100%)",
        borderRight: "1px solid rgba(59,130,246,0.1)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-6 gap-3" style={{ borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
        <Logo variant="desktop" />
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {user?.is_admin && (
          <div className="px-3 pb-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Main</p>
          </div>
        )}
        {items.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm group",
                isActive
                  ? "text-white font-medium"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/4"
              )}
                style={isActive ? { background: "rgba(59,130,246,0.15)", borderLeft: "2px solid #3b82f6" } : { borderLeft: "2px solid transparent" }}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-gray-600 group-hover:text-gray-400")} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-blue-400 opacity-60" />}
              </div>
            </Link>
          );
        })}

        {user?.is_admin && (
          <>
            <div className="px-3 pb-2 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Admin</p>
            </div>
            {adminItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm group",
                        isActive
                          ? "text-white font-medium"
                          : "text-gray-500 hover:text-gray-200 hover:bg-white/4"
                      )}
                    style={isActive ? { background: "rgba(59,130,246,0.15)", borderLeft: "2px solid #3b82f6" } : { borderLeft: "2px solid transparent" }}
                  >
                        <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-gray-600 group-hover:text-gray-400")} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 text-blue-400 opacity-60" />}
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* User + Logout */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(59,130,246,0.08)" }}>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa" }}>
              {user.username?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-600 truncate">{user.is_admin ? "Administrator" : "Trader"}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: "#070d1a" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Animated background behind all content */}
        <CryptoBackground intensity={0.6} />

        {/* Top bar */}
        <header
          className="h-16 flex items-center px-6 sticky top-0 z-20 shrink-0"
          style={{
            background: "rgba(7,13,26,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(59,130,246,0.1)",
          }}
        >
          <div className="flex items-center md:hidden">
            <Logo variant="mobile" />
          </div>
        </header>

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

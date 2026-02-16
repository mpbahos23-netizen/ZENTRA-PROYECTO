import { Link, useLocation } from "react-router-dom";
import { Truck, LayoutDashboard, Package, Calculator, Users, Settings, LogOut, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ElementType };

const carrierNav: NavItem[] = [
  { label: "Dashboard", href: "/carrier", icon: LayoutDashboard },
  { label: "Shipments", href: "/carrier/shipments", icon: Package },
  { label: "Analytics", href: "/carrier/analytics", icon: BarChart3 },
  { label: "Settings", href: "/carrier/settings", icon: Settings },
];

const clientNav: NavItem[] = [
  { label: "Dashboard", href: "/client", icon: LayoutDashboard },
  { label: "Book Shipment", href: "/client/book", icon: Package },
  { label: "Get Quote", href: "/quote", icon: Calculator },
  { label: "Invoices", href: "/client/invoices", icon: FileText },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Carriers", href: "/admin/carriers", icon: Truck },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "carrier" | "client" | "admin";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const location = useLocation();
  const navItems = role === "carrier" ? carrierNav : role === "client" ? clientNav : adminNav;
  const roleLabel = role === "carrier" ? "Carrier" : role === "client" ? "Client" : "Admin";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-navy-deep border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center">
              <Truck className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-lg font-bold text-primary-foreground">LogiCore</span>
          </Link>
          <p className="text-xs text-primary-foreground/40 mt-1">{roleLabel} Portal</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-teal"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card flex items-center px-6 justify-between">
          <h2 className="text-lg font-semibold text-foreground">{roleLabel} Dashboard</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center text-teal text-sm font-bold">
              JD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

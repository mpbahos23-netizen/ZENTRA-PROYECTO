import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Truck, LayoutDashboard, PackagePlus, FileSignature, FileText,
  Settings, LogOut, Search, Zap, Radio, Menu, X as CloseIcon, Loader2, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import { useState, useEffect } from "react";
import InstallPWA from "@/components/pwa/InstallPWA";
import { Download } from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ElementType };

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: string;
}

const DashboardLayout = ({ children, role: initialRole }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [role, setRole] = useState<string | undefined>(initialRole);
  const [loading, setLoading] = useState(!initialRole);

  useEffect(() => {
    const fetchRole = async () => {
      if (!initialRole) {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        console.log("DashboardLayout - Fetching role for user:", user?.id);
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          console.log("DashboardLayout - Profile fetched:", profile);
          if (profile) setRole(profile.role);
        }
        setLoading(false);
      } else {
        setRole(initialRole);
        setLoading(false);
      }
    };
    fetchRole();
  }, [initialRole]);

  const navItems: NavItem[] = role === 'admin' 
    ? [
        { label: "Panel Admin", href: "/admin", icon: LayoutDashboard },
        { label: "Operaciones", href: "/admin/operations", icon: Radio },
        { label: "Facturación", href: "/client/invoices", icon: FileText },
      ]
    : role === 'carrier' || role === 'client'
      ? [
          { label: "Panel Principal", href: "/carrier", icon: LayoutDashboard },
          { label: "Solicitudes", href: "/carrier/jobs", icon: Radio },
          { label: "Ganancias", href: "/carrier/earnings", icon: DollarSign },
          { label: "Nuevo Envío", href: "/client/book", icon: PackagePlus },
          { label: "Presupuesto", href: "/quote", icon: FileSignature },
          { label: "Facturas", href: "/client/invoices", icon: FileText },
        ]
      : []; // Don't show items while loading or if no role is found

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#00e5ff]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 md:hidden flex flex-col p-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00e5ff] flex items-center justify-center">
                 <Truck className="w-6 h-6 text-black" fill="currentColor" />
              </div>
              <span className="text-xl font-bold tracking-tight">ZENTRA</span>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <CloseIcon className="w-6 h-6 text-zinc-400" />
            </button>
          </div>
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all",
                  location.pathname.includes(item.href) ? "bg-[#00e5ff] text-black" : "text-zinc-400 bg-white/5"
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=paula" alt="Paula Bahos" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold">Paula Bahos</p>
                <p className="text-xs text-zinc-500">Gestor Logístico</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-[260px] flex-col bg-black border-r border-white/5">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff] flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight text-white tracking-wide">ZENTRA</span>
              <span className="text-[10px] font-bold text-[#00e5ff] tracking-wider">LOGISTICS OS</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.includes(item.href) || (item.label === 'Panel Principal' && location.pathname === '/carrier');
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                  active
                    ? "text-[#00e5ff] bg-[#00e5ff]/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#00e5ff] rounded-r-full" />
                )}
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Elements */}
        <div className="p-4 space-y-4">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-xs font-medium text-zinc-400">Cuenta Premium</span>
            <Button className="w-full bg-[#00e5ff] hover:bg-[#00cce6] text-black font-semibold rounded-xl" size="sm">
              <Zap className="w-4 h-4 mr-2" fill="currentColor" /> Mejorar Plan
            </Button>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                <img src="https://i.pravatar.cc/150?u=paula" alt="Paula Bahos" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Paula Bahos</span>
                <span className="text-xs text-zinc-500">Gestor Logístico</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-zinc-500 hover:text-white transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Topbar */}
        <header className="h-[88px] border-b border-white/5 bg-black flex items-center px-4 md:px-8 justify-between gap-4">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Menu className="w-6 h-6 text-zinc-400" />
          </button>
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
            <Input
              className="w-full bg-[#111111] border-transparent text-white placeholder:text-zinc-500 pl-10 md:pl-12 h-10 md:h-12 rounded-full focus-visible:ring-1 focus-visible:ring-white/20 text-xs md:text-sm"
              placeholder="Buscar envío..."
            />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => window.dispatchEvent(new Event('beforeinstallprompt'))}
              className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors sm:hidden"
              title="Descargar App"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <NotificationsPanel />
            </div>
            <button className="w-10 h-10 rounded-full bg-[#111111] border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <Button asChild className="hidden sm:flex bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-6 h-10 ml-2 cursor-pointer shadow-lg">
              <Link to="/client/book">+ Envío</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* ZENTRA: PWA Installer UI */}
      <InstallPWA />
    </div>
  );
};

export default DashboardLayout;

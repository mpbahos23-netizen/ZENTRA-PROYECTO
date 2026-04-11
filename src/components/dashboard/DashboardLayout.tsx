import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Truck, LayoutDashboard, PackagePlus, FileSignature, FileText,
  Settings, LogOut, Search, Zap, Radio, Menu, X as CloseIcon,
  Loader2, DollarSign, Package, Bell
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
  const [profileName, setProfileName] = useState<string>("Usuario Zentra");
  const [loading, setLoading] = useState(!initialRole);

  useEffect(() => {
    const fetchRole = async () => {
      if (!initialRole) {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .single();
          if (profile) {
            setRole(profile.role);
            setProfileName(profile.full_name || "Usuario Zentra");
          }
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
        { label: "Inventario", href: "/admin/inventory", icon: Package },
        { label: "Ganancias", href: "/carrier/earnings", icon: DollarSign },
        { label: "Nuevo Envío", href: "/client/book", icon: PackagePlus },
        { label: "Presupuesto", href: "/quote", icon: FileSignature },
        { label: "Facturas", href: "/client/invoices", icon: FileText },
      ]
    : role === 'carrier'
      ? [
          { label: "Dashboard", href: "/carrier", icon: LayoutDashboard },
          { label: "Solicitudes", href: "/carrier/jobs", icon: Radio },
          { label: "Ganancias", href: "/carrier/earnings", icon: DollarSign },
        ]
      : role === 'client'
        ? [
            { label: "Mis Envíos", href: "/client", icon: LayoutDashboard },
            { label: "Nuevo Envío", href: "/client/book", icon: PackagePlus },
            { label: "Facturas", href: "/client/invoices", icon: FileText },
            { label: "Presupuesto", href: "/quote", icon: FileSignature },
          ]
        : [];

  // Bottom nav shows first 4 items for mobile
  const bottomNavItems = navItems.slice(0, 4);

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
      <div className="flex items-center justify-center h-screen bg-black w-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#00e5ff]" />
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">Sincronizando Zentra...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    location.pathname === href || (location.pathname.startsWith(href) && href !== '/');

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden w-full relative">

      {/* ── Mobile Full-Screen Menu Overlay (for extra items / settings) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 md:hidden flex flex-col p-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <img src="/zentra-logo.jpg" alt="Zentra Logo" className="h-10 w-auto object-contain rounded-lg" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
            >
              <CloseIcon className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all",
                  isActive(item.href)
                    ? "bg-[#00e5ff] text-black"
                    : "text-zinc-400 bg-white/5 hover:bg-white/10"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                {role === 'admin' ? (
                  <img src="https://i.pravatar.cc/150?u=paula" alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <Truck className="w-6 h-6 text-zinc-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-sm">{profileName}</p>
                <p className="text-xs text-zinc-500">
                  {role === 'admin' ? 'Administrador' : role === 'carrier' ? 'Transportista' : 'Cliente'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-[260px] flex-col bg-black border-r border-white/5">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/zentra-logo.jpg" alt="Zentra Logo" className="h-10 w-auto object-contain rounded-lg" />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
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

        <div className="p-4 space-y-4">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <span className="text-xs font-medium text-zinc-400">Cuenta Premium</span>
            <Button
              className="w-full bg-[#00e5ff] hover:bg-[#00cce6] text-black font-semibold rounded-xl"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" fill="currentColor" /> Mejorar Plan
            </Button>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
                {role === 'admin' ? (
                  <img src="https://i.pravatar.cc/150?u=paula" alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <Truck className="w-5 h-5 text-zinc-600" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{profileName}</span>
                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">
                  {role === 'admin' ? 'Administrador' : role === 'carrier' ? 'Transportista' : 'Cliente'}
                </span>
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Topbar */}
        <header className="h-[64px] md:h-[88px] border-b border-white/5 bg-black flex items-center px-4 md:px-8 justify-between gap-4 shrink-0">
          {/* Mobile: Logo left, actions right */}
          <div className="md:hidden flex items-center gap-3">
            <img src="/zentra-logo.jpg" alt="Zentra Logo" className="h-8 w-auto object-contain rounded-lg" />
          </div>

          {/* Desktop: Search bar */}
          <div className="relative hidden md:flex flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              className="w-full bg-[#111111] border-transparent text-white placeholder:text-zinc-500 pl-12 h-12 rounded-full focus-visible:ring-1 focus-visible:ring-white/20 text-sm"
              placeholder="Buscar envío, cliente..."
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Search icon */}
            <button className="md:hidden w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="hidden sm:block">
              <NotificationsPanel />
            </div>

            {/* Mobile: Bell */}
            <button className="sm:hidden w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
              <Bell className="w-4 h-4" />
            </button>

            {/* PWA install */}
            <button
              onClick={() => window.dispatchEvent(new Event('beforeinstallprompt'))}
              className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors sm:hidden"
              title="Instalar App"
            >
              <Download className="w-4 h-4" />
            </button>

            <button className="hidden md:flex w-10 h-10 rounded-full bg-[#111111] border border-white/5 items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            <Button
              asChild
              className="hidden sm:flex bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-5 h-9 md:h-10 text-xs md:text-sm shadow-lg"
            >
              <Link to="/client/book">+ Envío</Link>
            </Button>

            {/* Mobile: Hamburger for extra nav */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-full bg-white/5 flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </header>

        {/* Page content - add bottom padding on mobile for the bottom nav */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around h-16 px-1 safe-area-pb">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all py-2",
                  active ? "text-[#00e5ff]" : "text-zinc-600 active:text-zinc-400"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    active && "drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]"
                  )}
                />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-wide leading-none",
                  active ? "text-[#00e5ff]" : "text-zinc-700"
                )}>
                  {item.label.split(' ')[0]}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-6 h-0.5 bg-[#00e5ff] rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Logout button in bottom nav */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl text-zinc-700 active:text-red-400 transition-all py-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wide leading-none">Salir</span>
          </button>
        </div>
      </nav>

      <InstallPWA />
    </div>
  );
};

export default DashboardLayout;

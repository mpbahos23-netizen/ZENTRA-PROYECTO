import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Truck, Zap } from "lucide-react";

// ============================================
// ZENTRA OBSIDIAN: Stealth Navbar
// Minimalist Overlay Navigation
// ============================================

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060E20]/80 backdrop-blur-2xl border-b border-white/5 font-inter">
      <div className="container mx-auto flex items-center justify-between h-20 px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all group-hover:scale-110">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-2xl font-black text-white italic tracking-tighter uppercase">Zentra</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#how-it-works" className="text-xs font-medium text-zinc-400 hover:text-white tracking-widest transition-all">Sistemas</a>
          <a href="#features" className="text-xs font-medium text-zinc-400 hover:text-white tracking-widest transition-all">Tecnología</a>
          <a href="#pricing" className="text-xs font-medium text-zinc-400 hover:text-white tracking-widest transition-all">Red</a>
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-xs font-medium text-zinc-400 hover:text-white tracking-widest transition-all">
            Identificación
          </Link>
          <Button asChild className="h-12 bg-white text-black font-bold tracking-widest rounded-full px-8 hover:bg-zinc-200 shadow-xl text-xs">
            <Link to="/signup">Comenzar</Link>
          </Button>
        </div>

        <button className="md:hidden w-10 h-10 flex items-center justify-center text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#060E20] border-b border-white/5 p-8 space-y-6 animate-in fade-in slide-in-from-top-10 duration-500">
          <a href="#how-it-works" className="block text-sm font-black text-zinc-500 hover:text-white uppercase tracking-widest py-2" onClick={() => setMobileOpen(false)}>Sistemas</a>
          <a href="#features" className="block text-sm font-black text-zinc-500 hover:text-white uppercase tracking-widest py-2" onClick={() => setMobileOpen(false)}>Tecnología</a>
          <a href="#pricing" className="block text-sm font-black text-zinc-500 hover:text-white uppercase tracking-widest py-2" onClick={() => setMobileOpen(false)}>Red</a>
          <div className="flex flex-col gap-4 pt-4">
            <Button asChild className="h-14 bg-white text-black font-bold tracking-widest rounded-2xl shadow-xl shadow-white/5">
               <Link to="/login" onClick={() => setMobileOpen(false)}>Acceso Cliente</Link>
            </Button>
            <Button asChild variant="outline" className="h-14 border border-zinc-800 text-zinc-400 font-medium tracking-widest rounded-2xl hover:bg-zinc-800">
               <Link to="/signup" onClick={() => setMobileOpen(false)}>Soy transportista</Link>
            </Button>
            <div className="flex flex-col gap-4 text-center pt-6 opacity-40">
               <Link to="/login" onClick={() => setMobileOpen(false)} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white">Autenticación de Sistemas</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

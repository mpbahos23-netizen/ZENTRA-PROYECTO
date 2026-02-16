import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Truck } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center">
            <Truck className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Route Nexus</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Características</a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Precios</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild className="bg-teal-gradient hover:opacity-90 transition-opacity">
            <Link to="/signup">Comenzar</Link>
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <a href="#how-it-works" className="block text-sm font-medium text-muted-foreground py-2">Cómo funciona</a>
          <a href="#features" className="block text-sm font-medium text-muted-foreground py-2">Características</a>
          <a href="#pricing" className="block text-sm font-medium text-muted-foreground py-2">Precios</a>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" asChild className="flex-1"><Link to="/login">Iniciar Sesión</Link></Button>
            <Button asChild className="flex-1 bg-teal-gradient"><Link to="/signup">Comenzar</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

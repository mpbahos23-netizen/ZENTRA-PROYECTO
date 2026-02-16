import { Truck } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-navy-deep py-12 border-t border-border">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center">
            <Truck className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="text-xl font-bold text-primary-foreground">Route Nexus</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-primary-foreground/50">
          <a href="#features" className="hover:text-primary-foreground/80 transition-colors">Características</a>
          <a href="#pricing" className="hover:text-primary-foreground/80 transition-colors">Precios</a>
          <Link to="/login" className="hover:text-primary-foreground/80 transition-colors">Iniciar Sesión</Link>
        </div>
        <p className="text-xs text-primary-foreground/30">© 2026 Route Nexus. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

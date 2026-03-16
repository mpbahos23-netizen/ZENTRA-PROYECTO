import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] bg-hero-gradient flex items-center overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(180 42% 41%) 1px, transparent 1px), linear-gradient(90deg, hsl(180 42% 41%) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal/20 bg-teal/5 mb-6 animate-fade-in">
            <Shield className="w-4 h-4 text-teal" />
            <span className="text-sm font-medium text-teal-light">Infraestructura Logística de Corredores Profesionales</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Gestiona tu Flota como una{" "}
            <span className="text-gradient-teal">Empresa Logística</span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Infraestructura profesional para transportistas modernos. Cotización inteligente, seguimiento en tiempo real y análisis de rendimiento — todo en una plataforma.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" asChild className="bg-teal-gradient hover:opacity-90 transition-opacity text-base px-8 py-6 shadow-glow-teal">
              <Link to="/signup">
                Soy Transportista
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/15 text-base px-8 py-6">
              <Link to="/signup?role=client">Quiero realizar un envío</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-xl overflow-hidden border border-teal/10 shadow-2xl">
            <img
              src={heroDashboard}
              alt="Panel de control de Movix mostrando seguimiento de flota y optimización de rutas"
              className="w-full h-auto"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

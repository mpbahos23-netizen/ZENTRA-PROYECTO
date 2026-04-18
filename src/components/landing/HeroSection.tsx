import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Truck, Sparkles, Globe } from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";

// ============================================
// ZENTRA OBSIDIAN: Kinetic Hero
// High-End Market Positioning
// ============================================

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-background flex items-center overflow-hidden font-inter transition-colors duration-500">
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '80px 80px'
      }} />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[180px] rounded-full -mr-96 -mt-96" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] rounded-full -ml-96 -mb-96" />

      <div className="container mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
            <Globe className="w-4 h-4 text-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.2em]">The Global Logistics Operating System</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
               Logistics <br /> <span className="text-blue-600">Reinvented</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
               Infraestructura profesional para transportistas modernos. <br className="hidden sm:block" /> 
               IA de ruta, seguimiento cinético y optimización de carga en una terminal única.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in zoom-in duration-1000 delay-700">
            <Button size="lg" asChild className="h-20 bg-white text-black font-bold uppercase tracking-[0.15em] rounded-full px-12 hover:bg-zinc-200 shadow-[0_20px_50px_rgba(255,255,255,0.05)] transition-all text-sm border border-white/10 group">
              <Link to="/signup?role=client" className="flex items-center gap-3">
                Quiero realizar un envío
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-20 bg-white/5 border-white/10 text-white font-bold uppercase tracking-[0.15em] rounded-full px-12 hover:bg-white/10 transition-all text-sm backdrop-blur-md">
              <Link to="/signup" className="flex items-center gap-3">
                 Soy transportista
                 <Truck className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="h-20 bg-transparent border border-white/5 text-zinc-500 font-bold uppercase tracking-[0.15em] rounded-full px-12 hover:bg-white/5 hover:text-white transition-all text-sm backdrop-blur-md">
              <Link to="/login" className="flex items-center gap-3">
                 Soy administrador
                 <Shield className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Tactical OS Preview */}
        <div className="max-w-6xl mx-auto mt-24 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-1000">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[52px] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
            <div className="relative rounded-[48px] overflow-hidden border border-white/10 bg-[#060E20] shadow-2xl">
                <img
                    src={heroDashboard}
                    alt="Zentra OS Preview"
                    className="w-full h-auto grayscale brightness-90 group-hover:grayscale-0 transition-all duration-1000"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060E20] via-transparent to-transparent opacity-60" />
                <div className="absolute top-10 left-10 flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/50" />
                   <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
            </div>
          </div>
        </div>

        {/* Strategic Proof */}
        <div className="container mx-auto px-6 mt-20 flex flex-wrap justify-center gap-12 opacity-30 grayscale invert">
            {['Uber Freight', 'Lalamove', 'Flexport', 'Convoy'].map(brand => (
              <span key={brand} className="text-sm font-bold uppercase tracking-[0.2em] text-white italic opacity-50">{brand}</span>
            ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

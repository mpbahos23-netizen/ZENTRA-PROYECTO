import { Check, Shield, Star, Zap, Cpu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Scale & Growth Plans
// Performance Tiers for Modern Logistics
// ============================================

const tiers = [
  {
    name: "Z-Standard",
    price: "$49",
    description: "Protocolo inicial para transportistas independientes.",
    features: ["Seguimiento LRT-01", "AI Matching Básico", "Dashboard de Métricas", "Soporte Standard"],
    cta: "Iniciar Protocolo",
    highlighted: false,
    icon: Zap
  },
  {
    name: "Z-Elite",
    price: "$149",
    description: "Para operaciones de alto rendimiento y flotas en expansión.",
    features: ["Analítica Quántica Advanced", "AI Vision (Scan Carga)", "Soporte Prioritario 24/7", "Protocolo de Seguros Z-X", "Acceso Multi-Unidad"],
    cta: "Escalar a Elite",
    highlighted: true,
    icon: Star
  },
  {
    name: "Z-Universe",
    price: "Custom",
    description: "Infraestructura total para corporaciones globales.",
    features: ["Integración API Full", "Matching de Carga LTL/FTL", "Gestor de Cuenta Elite", "SLA del 99.9%", "Personalización de Interfaz"],
    cta: "Solicitar Consulta",
    highlighted: false,
    icon: Shield
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-32 bg-[#060E20] relative font-inter overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-500/5 blur-[150px] rounded-full -mt-96" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
           <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em]">Optimización de Costos</h2>
           <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              Inversión <span className="text-zinc-700">Inteligente</span>
           </h1>
           <p className="text-sm text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed mt-4 px-10">
              Escala tus operaciones con infraestructura logística de grado empresarial. Sin comisiones ocultas.
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "relative bg-white/[0.02] border-white/5 rounded-[48px] p-10 transition-all duration-700 group hover:scale-[1.03] shadow-2xl overflow-hidden",
                tier.highlighted && "border-blue-500/30 bg-blue-500/[0.03] shadow-[0_0_80px_rgba(59,130,246,0.1)]"
              )}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-30 transition-opacity">
                   <Sparkles className="w-10 h-10 text-blue-500" />
                </div>
              )}
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <tier.icon className={cn("w-5 h-5", tier.highlighted ? "text-blue-500" : "text-zinc-600")} />
                     <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{tier.name}</h3>
                  </div>
                   <p className="text-sm text-zinc-400 font-medium">{tier.description}</p>
                </div>

                <div className="flex items-baseline gap-2 py-4 border-y border-white/5">
                  <span className="text-5xl font-black text-white italic tracking-tighter uppercase font-inter">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">/ Mes</span>}
                </div>

                <ul className="space-y-4">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-4 group/item">
                      <div className="w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                         <Check className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-sm font-medium text-zinc-400 group-hover:item:text-white transition-colors">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "w-full h-18 rounded-[32px] font-bold uppercase tracking-[0.2em] transition-all text-sm shadow-2xl group",
                    tier.highlighted 
                      ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20" 
                      : "bg-white/5 border border-white/5 text-white hover:bg-white/10"
                  )}
                >
                  <Link to="/signup">
                    {tier.cta}
                    <Zap className={cn("w-3.5 h-3.5 ml-3 transition-transform group-hover:scale-110", tier.highlighted ? "fill-white" : "fill-zinc-400")} />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Tactical Note */}
        <div className="text-center mt-20 opacity-30">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Zentra Global Infrastructure v3.1</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

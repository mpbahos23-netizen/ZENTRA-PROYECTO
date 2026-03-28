import { UserPlus, Route, BarChart3, Fingerprint, Zap, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Protocol Workflow
// Strategic Three-Phase Architecture
// ============================================

const steps = [
  {
    icon: Fingerprint,
    title: "Identificación Biométrica",
    description: "Acceso instantáneo para transportistas y empresas bajo estándares de seguridad Z-Security.",
    tag: "Protocolo 01"
  },
  {
    icon: Zap,
    title: "Matching Cinético",
    description: "IA de alta velocidad que conecta la carga con la unidad más eficiente en tiempo real.",
    tag: "Protocolo 02"
  },
  {
    icon: Globe,
    title: "Distribución Global",
    description: "Seguimiento satelital y optimización de rutas para expandir tu alcance logístico.",
    tag: "Protocolo 03"
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-32 bg-[#060E20] font-inter relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-white/5" />
      
      <div className="container mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
           <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em]">Arquitectura Operativa</h2>
           <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              Cómo <span className="text-zinc-700">funciona</span> Zentra
           </h1>
           <p className="text-sm text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed mt-4">
              Desde la identificación hasta la rentabilidad — tres fases estratégicas para una logística de alto rendimiento.
           </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[140px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />

          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative text-center group z-10 space-y-8"
            >
              <div className="relative w-32 h-32 mx-auto mb-10">
                 <div className="absolute inset-0 bg-blue-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                 <div className="relative w-32 h-32 rounded-[40px] bg-white/[0.04] border border-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 shadow-2xl overflow-hidden">
                    <step.icon className="w-12 h-12 text-zinc-500 group-hover:text-white transition-colors duration-500" />
                    <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                       <p className="text-4xl font-black italic text-white leading-none">{i + 1}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 px-6 scale-90 group-hover:scale-100 transition-transform duration-500">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-[0.1em]">{step.tag}</p>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{step.title}</h3>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-[260px] mx-auto py-2 group-hover:text-white transition-colors">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

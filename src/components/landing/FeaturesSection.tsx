import { 
  MapPin, 
  Shield, 
  Calculator, 
  Star, 
  TrendingUp, 
  Bell, 
  Zap, 
  Scan, 
  Cpu, 
  Navigation,
  ShieldCheck,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Core Capabilities
// High-Octane Logistics Infrastructure
// ============================================

const features = [
  {
    icon: Activity,
    title: "Seguimiento Cinético",
    description: "Monitor de posición sub-métrica con telemetría en tiempo real y geovallas dinámicas.",
    tag: "LRT-01"
  },
  {
    icon: ShieldCheck,
    title: "Seguridad Militar",
    description: "Identificación de pilotos verificada y encriptación end-to-end de manifiestos digitales.",
    tag: "SEC-X"
  },
  {
    icon: Cpu,
    title: "Motor Quántico",
    description: "Algoritmos de IA que optimizan rutas y cargas reduciendo costos en un 25%.",
    tag: "AI-V4"
  },
  {
    icon: Scan,
    title: "Visión Artificial",
    description: "Escaneo de carga por foto para cálculo exacto de volumen y optimización de espacio.",
    tag: "VIS-OS"
  },
  {
    icon: Star,
    title: "Reputación Pro",
    description: "Sistema de bindeo basado en performance, puntualidad y métricas corporativas.",
    tag: "REP-PRO"
  },
  {
    icon: Bell,
    title: "Alertas Activas",
    description: "Notificaciones push críticas para cada cambio de estado, retraso o confirmación.",
    tag: "NTF-SM"
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 bg-[#060E20] relative font-inter overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full -ml-[200px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full -mr-[200px]" />

      <div className="container mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
           <h2 className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em]">Core Capabilities</h2>
           <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
              Todo lo que necesitas <br /> <span className="text-zinc-700">para avanzar</span>
           </h1>
           <p className="text-sm text-zinc-400 font-medium max-w-xl mx-auto leading-relaxed mt-4">
              Herramientas tácticas diseñadas para la confiabilidad extrema en operaciones logísticas.
           </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <Card
              key={feature.title}
              className="bg-white/[0.02] border-white/5 rounded-[40px] p-10 hover:border-blue-500/20 transition-all duration-500 group relative overflow-hidden shadow-2xl hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                 <p className="text-xs font-bold text-blue-500 uppercase tracking-widest leading-none">{feature.tag}</p>
              </div>
              
              <div className="w-16 h-16 rounded-[22px] bg-white/5 flex items-center justify-center mb-8 border border-white/5 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-500">
                <feature.icon className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors duration-500" />
              </div>
              
              <div className="space-y-4">
                 <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{feature.title}</h3>
                 <p className="text-sm text-zinc-400 font-medium leading-relaxed group-hover:text-white transition-colors">
                   {feature.description}
                 </p>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Search, 
  Truck, 
  Zap, 
  Home, 
  Users, 
  Key, 
  Gift, 
  ChevronRight, 
  MapPin, 
  ArrowRight,
  Clock,
  Navigation,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Client Mobile Experience
// Ultra-Minimalist Logistics Command
// ============================================

const ClientDashboard = () => {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["client-dashboard-shipments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return data;
    },
  });

  const activeShipment = shipments?.[0];

  const services = [
    { id: 'heavy', label: 'Carga Pesada', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'express', label: 'Envío Express', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'moving', label: 'Mudanzas', icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'shared', label: 'Ruta Compartida', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'rental', label: 'Alquiler Truck', icon: Key, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
    { id: 'rewards', label: 'Puntos Zentra', icon: Gift, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <DashboardLayout role="client">
      <div className="max-w-md mx-auto space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-5 duration-700 font-inter">
        
        {/* HERO: AI Quoting Bar */}
        <div className="space-y-6">
          <div className="space-y-1">
             <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                ZENTRA <span className="text-zinc-700">OS</span>
             </h1>
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Soluciones Logísticas con IA</p>
          </div>

          <Link to="/quote" className="block">
            <div className="bg-[#060E20] border border-white/5 rounded-[32px] p-2 pr-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="w-14 h-14 rounded-[24px] bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
                  <Search className="w-6 h-6 text-black" />
               </div>
               <div className="flex-1">
                  <p className="text-white font-black text-lg tracking-tight">¿A dónde enviamos hoy?</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Cotización Inteligente en 2s</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
               </div>
            </div>
          </Link>
        </div>

        {/* TRACKING PREVIEW (If active) */}
        {activeShipment && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
               <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Rastreo en Tiempo Real</p>
               <Link to={`/carrier/tracking/${activeShipment.id}`} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Ver Mapa</Link>
            </div>
            
            <Card className="bg-[#060E20] border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group border-l-4 border-l-blue-500">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Carga en Camino</p>
                     <h3 className="text-white font-black text-xl tracking-tight">{activeShipment.origin} → {activeShipment.destination}</h3>
                  </div>
                  <div className="bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                     <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">En Tránsito</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                     <div className="absolute top-0 left-0 h-full bg-blue-500 w-[65%] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  </div>
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase">Llegada: <span className="text-white">Hoy, 18:30</span></span>
                     </div>
                     <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-blue-500 animate-pulse" />
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">A 12 KM</span>
                     </div>
                  </div>
               </div>
            </Card>
          </div>
        )}

        {/* SERVICES GRID: 2x3 */}
        <div className="space-y-4">
           <p className="text-xs font-black text-zinc-500 uppercase tracking-widest px-2">Nuestros Servicios</p>
           <div className="grid grid-cols-2 gap-4">
             {services.map((service) => (
               <Link 
                 key={service.id} 
                 to={service.id === 'heavy' ? '/quote' : '#'}
                 className="group"
               >
                 <Card className="h-full bg-[#060E20] border-white/5 rounded-[40px] p-8 hover:border-white/20 transition-all duration-300 relative overflow-hidden group-hover:scale-[1.02] shadow-xl">
                   <div className={cn(
                     "w-14 h-14 rounded-[24px] mb-6 flex items-center justify-center transition-transform group-hover:scale-110",
                     service.bg
                   )}>
                     <service.icon className={cn("w-6 h-6", service.color)} />
                   </div>
                   <h4 className="text-white font-black text-sm uppercase tracking-tight leading-tight mb-1">{service.label}</h4>
                   <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Solicitar ahora</p>
                   
                   <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                   </div>
                 </Card>
               </Link>
             ))}
           </div>
        </div>

        {/* FOOTER CALL TO ACTION */}
        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none p-8 rounded-[40px] shadow-2xl relative overflow-hidden group cursor-pointer">
           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Tip Logístico</p>
           <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
             Optimiza tus costos con <span className="underline">IA SMART CONSOLIDATION</span>.
           </h4>
           <div className="mt-6 flex justify-end">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:scale-110 transition-transform">
                 <Zap className="w-6 h-6 text-white" />
              </div>
           </div>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CarrierJobAlert from '@/components/realtime/CarrierJobAlert';
import { Card } from '@/components/ui/card';
import { useCarrierJobRequests } from '@/hooks/useJobRequests';
import { Loader2, Truck, Box, MapPin, Gauge, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Job Terminal
// Ultra-responsive Logistics List
// ============================================

export default function CarrierJobs() {
  const { pendingJobs, loading } = useCarrierJobRequests();
  
  const dummyJobs = [
    { 
      id: '1', 
      shipment: { 
        origin: 'Bogotá, DC', 
        destination: 'Medellín, ANT', 
        weight: 1200, 
        cargo_type: 'Perecederos', 
        price: 450000, 
        date: 'Hoy, 10:30 AM',
        volumen: '3.5 m³',
        prioridad: 'ALTA'
      }, 
      status: 'Aceptado' 
    },
    { 
      id: '2', 
      shipment: { 
        origin: 'Cali, VAC', 
        destination: 'Buenaventura, VAC', 
        weight: 5000, 
        cargo_type: 'Carga General', 
        price: 1200000, 
        date: 'Hoy, 09:15 AM',
        volumen: '12.0 m³',
        prioridad: 'NORMAL'
      }, 
      status: 'En Tránsito' 
    },
  ];

  return (
    <DashboardLayout role="carrier">
      <CarrierJobAlert />

      <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in slide-in-from-bottom-5 duration-700">
        
        {/* TERMINAL HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">
              Terminal de <span className="text-blue-500">Carga</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">
              Módulo de Operaciones en Tiempo Real
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-5 py-2.5 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sincronizado con IA</span>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* JOBS FEED */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Cola de Servicios</h2>
              <span className="text-[10px] font-black text-zinc-700 uppercase">{pendingJobs.length + dummyJobs.length} RESULTADOS</span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-32 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Cargando datos de ruta...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ACTIVE FEED */}
                {[...pendingJobs, ...dummyJobs].map((job, idx) => (
                  <Card key={job.id} className="bg-[#060E20] border-white/5 hover:border-blue-500/30 transition-all duration-300 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group hover:scale-[1.01]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex-1 space-y-6">
                        {/* Route Info */}
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3B82F6]" />
                            <div className="w-0.5 h-8 bg-zinc-800" />
                            <MapPin className="w-3 h-3 text-emerald-500" />
                          </div>
                          <div className="space-y-4">
                            <div>
                               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Origen</p>
                               <p className="text-white font-black text-lg">{job.shipment?.origin}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Destino</p>
                               <p className="text-white font-black text-lg">{job.shipment?.destination}</p>
                            </div>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                           <div className="space-y-1">
                              <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1">
                                <Box className="w-2.5 h-2.5" /> Volumen
                              </p>
                              <p className="text-xs font-black text-white">{job.shipment?.volumen || '4.2 m³'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1">
                                <Gauge className="w-2.5 h-2.5" /> Peso
                              </p>
                              <p className="text-xs font-black text-white">{job.shipment?.weight} KG</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1">
                                <ShieldAlert className="w-2.5 h-2.5" /> Prioridad
                              </p>
                              <p className={cn(
                                "text-xs font-black",
                                job.shipment?.prioridad === 'ALTA' ? 'text-orange-500' : 'text-blue-400'
                              )}>
                                {job.shipment?.prioridad || 'NORMAL'}
                              </p>
                           </div>
                        </div>
                      </div>

                      {/* Action Zone */}
                      <div className="flex flex-col justify-between items-end border-l border-white/5 pl-8 text-right min-w-[200px]">
                         <div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Pago Estimado</p>
                            <h4 className="text-3xl font-black text-white tracking-tighter">${job.shipment?.price?.toLocaleString()}</h4>
                         </div>
                         
                         <div className="space-y-3 w-full">
                            <span className={cn(
                              "text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest block text-center border",
                              job.status === 'Aceptado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                              job.status === 'En Tránsito' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-zinc-900 text-zinc-500 border-white/5'
                            )}>
                              {job.status}
                            </span>
                            <Button className="w-full bg-white text-black font-black uppercase tracking-widest rounded-2xl h-12 shadow-lg hover:bg-zinc-200 transition-all active:scale-95">
                               Detalles del Viaje
                            </Button>
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR METRICS */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="bg-[#060E20] border-white/5 p-8 rounded-[40px] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Estado Operativo</h3>
                
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                       <CheckCircle2 className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white tracking-tighter">98.4%</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Score Conductor</p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">
                      <span>Metas del Mes</span>
                      <span className="text-emerald-400">12/15 Viajes</span>
                    </div>
                    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 w-[80%] shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                     <Clock className="w-5 h-5 text-zinc-500" />
                     <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">
                        Próxima ventana de alta demanda: <span className="text-white font-black">17:00 PM - 20:00 PM</span>
                     </p>
                  </div>
                </div>
             </Card>

             <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-none p-8 rounded-[40px] shadow-2xl group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-white shadow-inner opacity-10" />
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Tip de Flota</p>
                <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                  Prioriza viajes compartidos para ganar un <span className="underline">20% más</span> hoy.
                </h4>
                <div className="mt-6 flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                     <Truck className="w-5 h-5 text-white" />
                  </div>
                </div>
             </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

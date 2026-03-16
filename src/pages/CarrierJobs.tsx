import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CarrierJobAlert from '@/components/realtime/CarrierJobAlert';
import { Card } from '@/components/ui/card';
import { useCarrierJobRequests } from '@/hooks/useJobRequests';
import { Loader2, Truck, Inbox } from 'lucide-react';
import { cn } from "@/lib/utils";

// ============================================
// CarrierJobs: Carrier's job management page
// Shows list of recent jobs and renders the alert overlay
// ============================================
export default function CarrierJobs() {
  const { pendingJobs, loading } = useCarrierJobRequests();
  const dummyJobs = [
    { id: '1', shipment: { origin: 'Bogotá, DC', destination: 'Medellín, ANT', weight: 1200, cargo_type: 'Perecederos', price: 450000, date: 'Hoy, 10:30 AM' }, status: 'Aceptado' },
    { id: '2', shipment: { origin: 'Cali, VAC', destination: 'Buenaventura, VAC', weight: 5000, cargo_type: 'Carga General', price: 1200000, date: 'Hoy, 09:15 AM' }, status: 'En Tránsito' },
    { id: '3', shipment: { origin: 'Barranquilla, ATL', destination: 'Cartagena, BOL', weight: 800, cargo_type: 'Frágil', price: 280000, date: 'Ayer, 04:45 PM' }, status: 'Completado' },
  ];

  return (
    <DashboardLayout role="carrier">
      <CarrierJobAlert />

      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Solicitudes de Viaje</h1>
            <p className="text-zinc-400 font-medium">Historial y solicitudes en tiempo real de ZENTRA.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistema Activo
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Solicitudes Recientes</h2>
            {loading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="w-10 h-10 animate-spin text-[#00e5ff]" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Real Pending Jobs */}
                {pendingJobs.map(job => (
                  <Card key={job.id} className="bg-[#0a0a0a] border-[#00e5ff]/30 rounded-3xl p-6 shadow-lg shadow-[#00e5ff]/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#00e5ff]" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/20 group-hover:scale-110 transition-transform">
                          <Truck className="w-7 h-7 text-[#00e5ff]" />
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-black tracking-tight uppercase">
                            {job.shipment?.origin} → {job.shipment?.destination}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{job.shipment?.cargo_type}</span>
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{job.shipment?.weight}kg</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-white tracking-tighter">${job.shipment?.price?.toLocaleString()}</p>
                        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 uppercase tracking-widest border border-amber-500/20">
                          Pendiente
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Dummy Jobs */}
                {dummyJobs.map(job => (
                  <Card key={job.id} className="bg-[#0a0a0a] border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                          <Truck className="w-7 h-7 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-black tracking-tight uppercase group-hover:text-[#00e5ff] transition-colors">
                            {job.shipment.origin} → {job.shipment.destination}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-zinc-600 font-bold text-[10px] uppercase tracking-widest">
                            <span>{job.shipment.date}</span>
                            <span>•</span>
                            <span>{job.shipment.cargo_type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">${job.shipment.price.toLocaleString()}</p>
                        <span className={cn(
                          "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                          job.status === 'Aceptado' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          job.status === 'En Tránsito' ? 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        )}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0a0a0a] border-white/10 p-8 rounded-[32px] shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e5ff]/5 blur-3xl rounded-full" />
              <h3 className="text-white font-black text-xs uppercase tracking-widest mb-6">Estado de Red</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                    <span>Disponibilidad</span>
                    <span className="text-[#00e5ff]">98%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00e5ff] w-[98%]" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">
                    Estás en una zona de alta demanda (**Bogotá**). Las solicitudes de subasta tienen prioridad.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, Package, Clock, CheckCircle2,
  ChevronRight, ArrowUpRight, Plus, MapPin, Navigation
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ============================================
// ZENTRA OBSIDIAN: Client Dashboard Refactor
// Focus on Shipment Table + Focused Search
// ============================================

const ClientDashboard = () => {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('shipments')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setShipments(data);
      setLoading(false);
    };

    fetchShipments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_route': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'delivered': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_route': return 'EN LÍNEA';
      case 'delivered': return 'FINALIZADO';
      case 'pending': return 'CONFIRMANDO';
      default: return 'PENDIENTE';
    }
  };

  return (
    <DashboardLayout role="client">
      <div className="max-w-6xl mx-auto space-y-12 pb-20 font-inter">

        {/* TOP SECTION: FOCUSED SEARCH */}
        <div className="flex flex-col items-center text-center space-y-8 py-10">
          <div className="space-y-4">
            <h1 className="text-white font-black text-6xl tracking-tighter italic uppercase leading-none">
              ZENTRA <span className="text-zinc-700">OS</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em]">Soluciones Logísticas con IA</p>
          </div>

          <Link to="/client/quote" className="group relative w-full max-w-2xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#060E20] border border-white/5 h-24 rounded-[32px] flex items-center px-8 gap-6 shadow-2xl transition-all group-hover:border-white/10 group-active:scale-[0.98]">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-black text-white italic tracking-tight">¿A dónde enviamos hoy?</h3>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Cotización Inteligente en 2s</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
          </Link>
        </div>

        {/* SHIPMENTS TABLE SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Historial de <span className="text-blue-500">Operaciones</span></h2>
            </div>
            <div className="flex gap-2">
               <button className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-4 py-2 rounded-full border border-blue-500/10">Todos</button>
               <button className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-4 py-2 hover:text-white transition-colors">En Línea</button>
               <button className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-4 py-2 hover:text-white transition-colors">Finalizados</button>
            </div>
          </div>

          <Card className="bg-[#060E20]/50 border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Referencia</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Ruta</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Fecha</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Total</th>
                    <th className="px-8 py-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Package className="w-10 h-10 animate-pulse" />
                          <p className="text-[9px] font-black uppercase tracking-widest">Sincronizando operaciones...</p>
                        </div>
                      </td>
                    </tr>
                  ) : shipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 py-10">
                          <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center">
                            <Plus className="w-8 h-8 text-zinc-700" />
                          </div>
                          <p className="text-zinc-600 font-bold text-sm tracking-tight">No tienes envíos registrados aún</p>
                          <Button asChild size="sm" className="bg-blue-600 h-10 rounded-full px-6 text-[10px] font-black uppercase tracking-widest">
                            <Link to="/client/quote">Iniciar Primer Envío</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    shipments.map((shipment) => (
                      <tr key={shipment.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => (window.location.href=`/client/track/${shipment.tracking_id}`)}>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", getStatusColor(shipment.status))}>
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-tighter">#{shipment.tracking_id}</p>
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{shipment.cargo_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex flex-col gap-1.5 max-w-[180px]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <p className="text-[10px] text-zinc-300 font-bold truncate uppercase">{shipment.origin_address.split(',')[0]}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <p className="text-[10px] text-zinc-300 font-bold truncate uppercase">{shipment.destination_address.split(',')[0]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <span className={cn("inline-flex px-3 py-1.5 rounded-full text-[8px] font-black tracking-widest border", getStatusColor(shipment.status))}>
                            {getStatusLabel(shipment.status)}
                          </span>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] text-zinc-300 font-black tracking-tighter uppercase">{new Date(shipment.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short' })}</p>
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{new Date(shipment.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute:'2-digit' })}</p>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-sm font-black text-white italic tracking-tighter">S/{shipment.price}</p>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <Button variant="ghost" className="w-10 h-10 rounded-full hover:bg-white/10 p-0 transition-all group-hover:translate-x-1">
                            <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* BOTTOM TIDY: TIPS */}
        <div className="bg-blue-600 rounded-[48px] p-10 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mb-2">TIP LOGÍSTICO</p>
              <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                Optimiza tus costos con <span className="opacity-70">IA Smart Consolidation.</span>
              </h4>
            </div>
          </div>
          <Button className="relative z-10 h-14 px-8 rounded-full bg-white text-blue-600 font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all">
            Ver servicios
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

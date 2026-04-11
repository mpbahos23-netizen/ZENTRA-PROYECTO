import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search, Package, ChevronRight, ArrowUpRight, Plus, Navigation
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ============================================
// ZENTRA OBSIDIAN: Client Dashboard Refactor
// Focus on Shipment Table + Focused Search
// + Filter Logic (Todos, En Linea, Finalizados)
// ============================================

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'on_route' | 'delivered'>('all');

  useEffect(() => {
    const fetchShipments = async () => {
      setLoading(true);
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

  // Filter Logic
  const filteredShipments = useMemo(() => {
    if (activeFilter === 'all') return shipments;
    return shipments.filter(s => s.status === activeFilter);
  }, [shipments, activeFilter]);

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
            <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.5em]">Logística Activa en Tiempo Real</p>
            </div>
          </div>

          <Link to="/client/quote" className="group relative w-full max-w-2xl block">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#060E20] border border-white/5 h-24 rounded-[32px] flex items-center px-8 gap-6 shadow-2xl transition-all group-hover:border-white/10 group-active:scale-[0.98]">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-black text-white italic tracking-tight">¿A dónde enviamos hoy?</h3>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Calculadora de precisión Z-V1</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
          </Link>
        </div>

        {/* SHIPMENTS TABLE SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-lg font-black text-white uppercase tracking-tighter">Historial de <span className="text-blue-500">Operaciones</span></h2>
            </div>
            
            {/* ACTIVE FILTERS (NOW WORKING) */}
            <div className="flex gap-2 bg-[#060E20] p-1.5 rounded-2xl border border-white/5">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'on_route', label: 'En Línea' },
                  { id: 'delivered', label: 'Finalizados' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id as any)}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all duration-300",
                      activeFilter === f.id 
                        ? "bg-blue-600 text-white shadow-[0_5px_15px_rgba(59,130,246,0.3)]" 
                        : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
            </div>
          </div>

          <Card className="bg-[#060E20]/50 border-white/5 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
            <div className="overflow-x-auto text-nowrap">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Referencia</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Ruta</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Estado</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Fecha/Hora</th>
                    <th className="px-8 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Total PEN</th>
                    <th className="px-8 py-6 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Package className="w-12 h-12 animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sincronizando Z-Network...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredShipments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center gap-4 py-10">
                          <div className="w-20 h-20 rounded-[32px] bg-zinc-950 flex items-center justify-center border border-white/5 shadow-inner">
                            <Plus className="w-10 h-10 text-zinc-800" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-zinc-400 font-black text-sm tracking-tight uppercase">Sin operaciones en esta categoría</p>
                            <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Inicia una nueva ruta arriba</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredShipments.map((shipment) => (
                      <tr 
                        key={shipment.id} 
                        className="group hover:bg-white/[0.02] transition-all cursor-pointer" 
                        onClick={() => navigate(`/client/track/${shipment.tracking_id}`)}
                      >
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-5">
                            <div className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg border", getStatusColor(shipment.status))}>
                              <Package className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-black text-white italic tracking-tighter">#{shipment.tracking_id}</p>
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{shipment.cargo_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex flex-col gap-2 max-w-[220px]">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                <p className="text-[11px] text-zinc-300 font-black truncate uppercase tracking-tight">{shipment.origin_address.split(',')[0]}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <p className="text-[11px] text-zinc-300 font-black truncate uppercase tracking-tight">{shipment.destination_address.split(',')[0]}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className={cn("inline-flex px-4 py-2 rounded-xl text-[9px] font-black tracking-[0.1em] border uppercase", getStatusColor(shipment.status))}>
                            {getStatusLabel(shipment.status)}
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-black text-zinc-200 tracking-tighter uppercase italic">{new Date(shipment.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year: 'numeric' })}</p>
                            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{new Date(shipment.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute:'2-digit' })}</p>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-xl font-black text-white italic tracking-tighter">S/ {shipment.price.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <div className="flex justify-end pr-4">
                            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all duration-300 group-hover:rotate-45">
                              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                            </div>
                          </div>
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
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-[56px] p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group gap-8 border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
          <div className="relative z-10 flex items-center gap-10">
            <div className="w-20 h-20 rounded-[32px] bg-white/20 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-xl">
              <Navigation className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] text-blue-200 font-black uppercase tracking-[0.4em]">Zentra Intelligence System</p>
              <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
                Optimiza tus costos con <br/><span className="opacity-60">IA SMART CONSOLIDATION.</span>
              </h4>
            </div>
          </div>
          <Button asChild className="relative z-10 h-16 px-10 rounded-full bg-white text-blue-700 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-100 transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer">
            <Link to="/client/quote">Ver servicios</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

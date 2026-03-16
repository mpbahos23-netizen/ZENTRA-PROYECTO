import { useEffect, useState } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CarrierJobAlert from "@/components/realtime/CarrierJobAlert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Clock, ClipboardCheck, MoreHorizontal, Flame, TrendingUp, MapPin } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

// ============================================
// CarrierDashboard: Enhanced for Module 8
// Includes Demand Prediction (Hot Zones)
// ============================================

const distributionData = [
  { name: 'Carga Marítima', value: 65, color: '#00e5ff' },
  { name: 'Carga Aérea', value: 25, color: '#3b82f6' },
  { name: 'Logística Terrestre', value: 10, color: '#8b5cf6' },
];

const revenueData = [
  { name: 'Lun', ingresos: 4500 }, { name: 'Mar', ingresos: 5200 },
  { name: 'Mié', ingresos: 4800 }, { name: 'Jue', ingresos: 6100 },
  { name: 'Vie', ingresos: 5900 }, { name: 'Sáb', ingresos: 3200 },
  { name: 'Dom', ingresos: 2100 },
];

export default function CarrierDashboard() {
  const [activeShipments, setActiveShipments] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [hotZones, setHotZones] = useState<{zone: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [shipmentsRes, allShipmentsRes] = await Promise.all([
        supabase.from('shipments').select('id', { count: 'exact' }).eq('carrier_id', user.id).in('status', ['accepted', 'in_transit', 'carrier_selected']),
        supabase.from('shipments').select('origin, status')
      ]);

      // Calculate Earnings (mock logic or real)
      setActiveShipments(shipmentsRes.count || 0);
      setTotalEarnings(12450); // Mocked for now

      // Hot Zones Logic (Real-time demand)
      const zoneCounts: Record<string, number> = {};
      (allShipmentsRes.data || []).forEach(s => {
        if (s.status === 'searching' || s.status === 'bidding') {
          const zone = s.origin.split(',')[0].trim();
          zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
        }
      });

      const processedZones = Object.entries(zoneCounts)
        .map(([zone, count]) => ({ zone, count }))
        .sort((a,b) => b.count - a.count)
        .slice(0, 3);

      setHotZones(processedZones);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout role="carrier">
      <CarrierJobAlert />
      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Dashboard Transportista</h1>
            <p className="text-zinc-400 font-medium">Estado real de su operación logística y demanda zonal.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-[#00e5ff]/10 border border-[#00e5ff]/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-[#00e5ff] animate-pulse" />
                <span className="text-xs font-black text-[#00e5ff] uppercase tracking-wider">Conectado / Buscando Carga</span>
             </div>
          </div>
        </div>

        {/* Stats Grid + Hot Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#0a0a0a] border-white/10 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 flex items-center justify-center border border-[#00e5ff]/20">
                <Package className="w-6 h-6 text-[#00e5ff]" />
              </div>
              <span className="text-[10px] font-black text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-1 rounded-lg uppercase tracking-widest">En Curso</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Viajes Activos</p>
              <h3 className="text-4xl font-black text-white">{activeShipments}</h3>
            </div>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10 p-6 rounded-3xl flex flex-col justify-between h-44 shadow-xl">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-widest">+8.2%</span>
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Ganancias Estimadas</p>
              <h3 className="text-4xl font-black text-white">${totalEarnings.toLocaleString()}</h3>
            </div>
          </Card>

          {/* HOT ZONES WIDGET (Module 8) */}
          <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/10 p-6 rounded-3xl h-44 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full group-hover:bg-orange-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                     <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-white font-bold uppercase text-xs tracking-widest">Zonas de Alta Demanda</h3>
               </div>
               <span className="text-zinc-500 text-[10px] font-black uppercase">Actualizado hace 2m</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
               {hotZones.length > 0 ? hotZones.map((zone, i) => (
                 <div key={zone.zone} className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">{zone.zone}</p>
                    <p className={`text-lg font-black ${i === 0 ? 'text-orange-500' : 'text-white'}`}>{zone.count}</p>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase">Envios Disp.</p>
                 </div>
               )) : (
                 <div className="col-span-3 flex items-center justify-center h-full text-zinc-600 text-[10px] font-bold uppercase">
                    Calculando predicción de tráfico...
                 </div>
               )}
            </div>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/10 p-8 rounded-3xl h-full min-h-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Rendimiento Semanal</h2>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                 <TrendingUp className="w-4 h-4" />
                 CONSISTENCIA DEL 94%
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ color: '#00e5ff', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="ingresos" stroke="#00e5ff" strokeWidth={4} dot={{ fill: '#00e5ff', r: 4 }} activeDot={{ r: 8, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-[#0a0a0a] border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center h-full min-h-[400px] shadow-2xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-8">Optimización de Carga</h2>
            <div className="flex-1 flex flex-col items-center justify-center relative w-full">
              <div className="h-[200px] w-full relative -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-white">839</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-black">Kilómetros</span>
                </div>
              </div>

              <div className="w-full space-y-3 mt-8">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs bg-white/5 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-zinc-400 font-bold uppercase">{item.name}</span>
                    </div>
                    <span className="font-black text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Global Opportunities Hint (Module 8) */}
        <div className="bg-teal-gradient p-[1px] rounded-3xl overflow-hidden shadow-2xl">
           <div className="bg-[#0a0a0a] rounded-[23px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                    <MapPin className="w-8 h-8 text-[#00e5ff]" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Oportunidades Estratégicas AI</h3>
                    <p className="text-zinc-400 text-sm max-w-md mt-1">
                       Basado en el histórico, mañana habrá un incremento de demanda del 40% en <b>Monterrey</b>. 
                       Posiciona tu flota con anticipación.
                    </p>
                 </div>
              </div>
              <Button 
                onClick={() => toast.success("AI: Analizando patrones de demanda... Prepárate para una alta carga en Monterrey mañana.")}
                className="bg-white text-black font-black uppercase tracking-widest px-8 h-14 rounded-2xl hover:bg-zinc-200 shadow-xl shadow-white/5 active:scale-95 transition-all"
              >
                 Ver Predicciones
              </Button>
           </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

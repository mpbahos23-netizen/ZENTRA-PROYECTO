import { useEffect, useState } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CarrierJobAlert from "@/components/realtime/CarrierJobAlert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  DollarSign, 
  Flame, 
  TrendingUp, 
  MapPin, 
  Power,
  ShieldCheck,
  Zap,
  Navigation
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCarrierGPS } from '@/hooks/useLocationTracking';

// ============================================
// ZENTRA OBSIDIAN: Carrier Dashboard
// High-end Logistics OS Architecture
// ============================================

const distributionData = [
  { name: 'Viajes Locales', value: 65, color: '#3B82F6' },
  { name: 'Nacionales', value: 25, color: '#60A5FA' },
  { name: 'Compartidos', value: 10, color: '#10B981' },
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
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Activate Global GPS Tracking when Online
  const { currentPosition, sending } = useCarrierGPS(null, isOnline);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [shipmentsRes, allShipmentsRes] = await Promise.all([
        supabase.from('shipments').select('id', { count: 'exact' }).eq('carrier_id', user.id).in('status', ['accepted', 'in_transit', 'carrier_selected']),
        supabase.from('shipments').select('origin, status')
      ]);

      setActiveShipments(shipmentsRes.count || 0);
      setTotalEarnings(12450); 

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

  const toggleStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      toast.success("ESTADO: EN LÍNEA. Transmitiendo ubicación GPS...", {
        icon: <Zap className="w-4 h-4 text-blue-500" />,
        description: "Ahora eres visible para los despachadores.",
        className: "bg-[#060E20] border-blue-500/30 text-white font-bold rounded-2xl"
      });
    } else {
      toast.info("ESTADO: DESCONECTADO. Transmisión detenida.");
    }
  };

  return (
    <DashboardLayout role="carrier">
      <CarrierJobAlert />
      <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">

        {/* --- HERO STATUS SECTION --- */}
        <div className="relative overflow-hidden rounded-[40px] bg-[#060E20] border border-white/5 p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -ml-20 -mb-20" />
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-blue-500/20">
                  ZENTRA CARRIER OS v2.0
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                ¡HOLA,<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">CENTRALIZADO!</span>
              </h1>
              <p className="text-zinc-500 text-lg font-medium max-w-md">
                Tu flota está lista para dominar la logística de hoy.
              </p>
            </div>

            {/* RADIAL TOGGLE STATUS */}
            <div className="relative flex flex-col items-center group">
              <div 
                onClick={toggleStatus}
                className={cn(
                  "w-48 h-48 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative",
                  isOnline 
                    ? "bg-blue-600 shadow-[0_0_80px_rgba(59,130,246,0.3)] scale-105" 
                    : "bg-zinc-900 border-2 border-white/5 shadow-inner"
                )}
              >
                {isOnline && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
                )}
                <Power className={cn("w-12 h-12 mb-2 transition-all duration-500", isOnline ? "text-white rotate-0" : "text-zinc-700 rotate-12")} />
                <span className={cn("text-xs font-black uppercase tracking-widest", isOnline ? "text-white" : "text-zinc-600")}>
                  {isOnline ? "EN LÍNEA" : "OFFLINE"}
                </span>
                
                {/* Visual indicator of "Scanning" */}
                {isOnline && (
                  <div className="absolute -inset-4 border border-blue-500/20 rounded-full animate-[spin_8s_linear_infinite]" />
                )}
              </div>
              <p className="mt-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                {isOnline ? "BUSCANDO CARGA..." : "TOCA PARA ACTIVARTE"}
              </p>
            </div>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl p-8 rounded-[32px] hover:bg-white/[0.04] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 group-hover:scale-110 transition-transform">
                <Navigation className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-2">Servicios en Curso</p>
              <h3 className="text-5xl font-black text-white tracking-tighter">{activeShipments}</h3>
              <div className="mt-4 flex items-center gap-2 text-blue-400 text-[10px] font-bold">
                 <ShieldCheck className="w-3 h-3" /> MONITOREO GPS ACTIVO
              </div>
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl p-8 rounded-[32px] hover:bg-white/[0.04] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-2">Ganancias Netas</p>
              <h3 className="text-5xl font-black text-white tracking-tighter">${totalEarnings.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                 <TrendingUp className="w-3 h-3" /> +12% VS SEMANA ANTERIOR
              </div>
            </div>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl p-8 rounded-[32px] hover:bg-white/[0.04] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl rounded-full" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-7 h-7 text-orange-500" />
              </div>
              <p className="text-xs text-zinc-500 font-black uppercase tracking-widest mb-2">Zonas Calientes</p>
              <div className="flex gap-2">
                {hotZones.map((zone, i) => (
                  <div key={zone.zone} className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <p className="text-[9px] font-black text-white uppercase">{zone.zone}</p>
                    <p className="text-lg font-black text-orange-400">{zone.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* --- PERFORMANCE CHART --- */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-[#060E20] border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gráfico de Tracción</h2>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Ingresos por Jornada Laboral</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3B82F6]" />
                   <span className="text-white text-[10px] font-black uppercase tracking-widest">Optimizado x IA</span>
                </div>
             </div>
             <div className="h-[320px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={revenueData}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                   <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#4b5563', fontSize: 10, fontWeight: '900' }} 
                   />
                   <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#4b5563', fontSize: 10, fontWeight: '900' }} 
                   />
                   <RechartsTooltip
                     contentStyle={{ 
                        backgroundColor: 'rgba(6, 14, 32, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '24px',
                        backdropFilter: 'blur(10px)',
                        padding: '16px'
                      }}
                     itemStyle={{ color: '#3B82F6', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                   />
                   <Line 
                     type="monotone" 
                     dataKey="ingresos" 
                     stroke="#3B82F6" 
                     strokeWidth={6} 
                     dot={{ fill: '#3B82F6', r: 6, strokeWidth: 0 }} 
                     activeDot={{ r: 10, fill: '#fff' }} 
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </Card>

          <Card className="bg-[#060E20] border-white/5 p-8 rounded-[40px] shadow-2xl flex flex-col items-center">
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-8">Flota Activa</h2>
            <div className="flex-1 w-full relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={100}
                    paddingAngle={10}
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
                <span className="text-4xl font-black text-white tracking-tighter">83%</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Utilidad</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-10">
              {distributionData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-[10px] bg-white/[0.03] border border-white/5 px-4 py-4 rounded-2xl group hover:bg-white/[0.06] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}44` }}></div>
                    <span className="text-zinc-400 font-black uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="font-black text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}

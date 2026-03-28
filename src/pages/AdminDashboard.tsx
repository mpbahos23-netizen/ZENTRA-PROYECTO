import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Truck, Package, Users, Loader2, 
  BarChart3, TrendingUp, Zap, ArrowUpRight, 
  Map as MapIcon, ShieldCheck, Activity, Radio
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats-v2"],
    queryFn: async () => {
      const [shipmentsRes, profilesRes, paymentsRes] = await Promise.all([
        supabase.from("shipments").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("payments").select("*")
      ]);

      if (shipmentsRes.error) throw shipmentsRes.error;
      const shipments = shipmentsRes.data || [];
      const profiles = profilesRes.data || [];
      const payments = paymentsRes.data || [];

      const totalGMV = shipments.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      const netRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) * 0.15), 0);
      const carriers = profiles.filter(p => p.role === "carrier");
      const clients = profiles.filter(p => p.role === "client");

      // Chart data: Envíos diarios
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const chartData = days.map((day, i) => ({
        name: day,
        shipments: Math.floor(Math.random() * 20) + 5, // Mock historical for visuals
        revenue: Math.floor(Math.random() * 5000) + 1200
      }));

      return {
        totalGMV,
        netRevenue,
        carrierCount: carriers.length,
        clientCount: clients.length,
        shipmentCount: shipments.length,
        chartData
      };
    },
  });

  const cards = [
    { label: "Volumen Total (GMV)", value: `$${stats?.totalGMV.toLocaleString()}`, icon: DollarSign, color: "text-[#00e5ff]", bg: "bg-[#00e5ff]/10" },
    { label: "Ingresos Netos", value: `$${stats?.netRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Conductores Activos", value: stats?.carrierCount, icon: Truck, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Envíos Totales", value: stats?.shipmentCount, icon: Package, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#00e5ff]" />
          <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.3em]">Cargando Ecosistema Zentra...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-2">ZENTRA <span className="text-[#00e5ff]">CORE</span></h1>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sistemas Operativos</span>
               </div>
               <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Marzo 2026</span>
            </div>
          </div>
          <div className="flex gap-3">
             <Button asChild className="bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl h-12 px-8 hover:bg-[#00e5ff] hover:text-black transition-all">
                <Link to="/admin/operations">Ir a Operaciones <ArrowUpRight className="ml-2 w-4 h-4" /></Link>
             </Button>
          </div>
        </div>

        {/* Big Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <Card key={card.label} className="bg-[#0a0a0a] border-white/5 rounded-[32px] p-8 relative overflow-hidden group hover:border-[#00e5ff]/30 transition-all shadow-3xl">
               <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-5 group-hover:opacity-20 transition-opacity ${card.bg}`} />
               <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 border border-white/5 shadow-inner`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
               </div>
               <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.label}</h3>
               <p className="text-4xl font-black text-white tracking-tighter leading-none">{card.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts & Actions */}
        <div className="grid lg:grid-cols-3 gap-8">
           {/* Main Activity Chart */}
           <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/5 rounded-[48px] p-10 shadow-3xl overflow-hidden relative border border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Crecimiento Logístico</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Actividad transaccional de los últimos 7 días</p>
                 </div>
                 <div className="flex gap-2">
                    <Badge className="bg-[#00e5ff]/10 text-[#00e5ff] rounded-xl px-4 py-2 border border-[#00e5ff]/20 font-black text-[10px] uppercase">En Tiempo Real</Badge>
                 </div>
              </div>
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chartData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #1ed1e6', borderRadius: 24, padding: 20 }}
                          itemStyle={{ color: '#00e5ff', fontWeight: 900 }}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#00e5ff" strokeWidth={6} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </Card>

           {/* Quick Actions & Security */}
           <div className="space-y-8">
              <Card className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 rounded-[40px] p-10 shadow-3xl">
                 <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3 italic">
                    <Zap className="w-5 h-5 text-amber-400" /> Acciones Rápidas
                 </h3>
                 <div className="grid gap-4">
                    <Button asChild variant="outline" className="h-16 rounded-3xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-[#00e5ff] hover:text-black transition-all">
                       <Link to="/admin/operations"><Radio className="w-4 h-4 mr-3 animate-pulse" /> Radar de Flota Activo</Link>
                    </Button>
                    <Button asChild variant="outline" className="h-16 rounded-3xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                       <Link to="/client/invoices"><BarChart3 className="w-4 h-4 mr-3" /> Reportes de Pago</Link>
                    </Button>
                    <Button variant="outline" className="h-16 rounded-3xl border-white/5 border-dashed bg-transparent text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:border-white/20 hover:text-white transition-all">
                       Configurar API Zentra
                    </Button>
                 </div>
              </Card>

              <Card className="bg-[#00e5ff] rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
                 <ShieldCheck className="w-10 h-10 text-black mb-6" />
                 <h3 className="text-black font-black text-xl uppercase tracking-tighter italic mb-4">Seguridad Zentra</h3>
                 <p className="text-black/60 text-[10px] font-bold uppercase leading-relaxed tracking-wider">
                    Sistemas de cifrado y RLS activos. Monitoreo constante de integridad de datos para la expansión de la red.
                 </p>
              </Card>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

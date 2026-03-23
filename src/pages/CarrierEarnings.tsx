import { useState } from 'react';
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Calendar, 
  Wallet, 
  Zap, 
  Target,
  ChevronRight,
  Clock,
  Truck,
  Star,
  Medal
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from "@/lib/utils";

// ============================================
// ZENTRA OBSIDIAN: Carrier Earnings Dashboard
// Premium Financial Command Center
// ============================================

const weeklyData = [
  { day: 'Lun', ganancia: 185000, viajes: 4 },
  { day: 'Mar', ganancia: 245000, viajes: 6 },
  { day: 'Mié', ganancia: 198000, viajes: 5 },
  { day: 'Jue', ganancia: 312000, viajes: 7 },
  { day: 'Vie', ganancia: 287000, viajes: 6 },
  { day: 'Sab', ganancia: 156000, viajes: 3 },
  { day: 'Dom', ganancia: 98000, viajes: 2 },
];

const hourlyData = [
  { hora: '6am', valor: 0 },
  { hora: '8am', valor: 45000 },
  { hora: '10am', valor: 120000 },
  { hora: '12pm', valor: 185000 },
  { hora: '2pm', valor: 230000 },
  { hora: '4pm', valor: 310000 },
  { hora: '6pm', valor: 385000 },
  { hora: '8pm', valor: 420000 },
];

const recentTrips = [
  { id: 1, route: 'Bogotá → Medellín', amount: 450000, time: 'Hace 2h', type: 'Privado', rating: 5 },
  { id: 2, route: 'Cali → Buenaventura', amount: 280000, time: 'Hace 5h', type: 'Compartido', rating: 4 },
  { id: 3, route: 'Zona Norte → Sur', amount: 95000, time: 'Ayer', type: 'Express', rating: 5 },
  { id: 4, route: 'Centro → Aeropuerto', amount: 120000, time: 'Ayer', type: 'Privado', rating: 5 },
];

type TimeRange = 'hoy' | 'semana' | 'mes';

export default function CarrierEarnings() {
  const [timeRange, setTimeRange] = useState<TimeRange>('semana');

  const totalEarnings = timeRange === 'hoy' ? 420000 : timeRange === 'semana' ? 1481000 : 5924000;
  const totalTrips = timeRange === 'hoy' ? 8 : timeRange === 'semana' ? 33 : 132;
  const avgPerTrip = Math.round(totalEarnings / totalTrips);
  const growthPercent = timeRange === 'hoy' ? 15.3 : timeRange === 'semana' ? 12.1 : 8.7;

  return (
    <DashboardLayout role="carrier">
      <div className="max-w-7xl mx-auto space-y-8 pb-32 animate-in fade-in duration-700">

        {/* === HERO BALANCE === */}
        <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#060E20] via-[#0a1628] to-[#060E20] border border-white/5 p-10 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full -ml-20 -mb-20" />
          
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />

          <div className="relative z-10">
            {/* Time Range Selector */}
            <div className="flex justify-between items-start flex-wrap gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Balance de Ganancias</span>
                </div>
              </div>

              <div className="flex gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-1.5">
                {(['hoy', 'semana', 'mes'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      timeRange === range 
                        ? "bg-white text-black shadow-lg" 
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Balance */}
            <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
              <div>
                <p className="text-zinc-500 font-bold text-sm mb-3">Total {timeRange === 'hoy' ? 'de Hoy' : timeRange === 'semana' ? 'Semanal' : 'Mensual'}</p>
                <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter leading-none">
                  ${totalEarnings.toLocaleString()}
                </h1>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-black">+{growthPercent}%</span>
                  </div>
                  <span className="text-zinc-600 text-xs font-bold uppercase">vs periodo anterior</span>
                </div>
              </div>

              {/* Mini Stats Column */}
              <div className="flex gap-6">
                <div className="text-center bg-white/[0.03] border border-white/5 rounded-3xl px-8 py-6">
                  <p className="text-4xl font-black text-white tracking-tighter">{totalTrips}</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Viajes</p>
                </div>
                <div className="text-center bg-white/[0.03] border border-white/5 rounded-3xl px-8 py-6">
                  <p className="text-4xl font-black text-white tracking-tighter">${(avgPerTrip / 1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Promedio</p>
                </div>
                <div className="text-center bg-emerald-500/5 border border-emerald-500/10 rounded-3xl px-8 py-6">
                  <p className="text-4xl font-black text-emerald-400 tracking-tighter">4.9</p>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === CHARTS ROW === */}
        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* Weekly Bar Chart */}
          <Card className="lg:col-span-3 bg-[#060E20] border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Tracción Semanal</h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">Ingresos por día laboral</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase">Mar 17 - Mar 23</span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: '900' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 10, fontWeight: '900' }} 
                    tickFormatter={(v) => `${(v/1000).toFixed(0)}K`}
                  />
                  <RechartsTooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(6,14,32,0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)',
                      padding: '16px'
                    }}
                    itemStyle={{ color: '#10B981', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ganancia']}
                  />
                  <Bar dataKey="ganancia" radius={[12, 12, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 3 ? '#10B981' : '#3B82F6'} 
                        opacity={index === 3 ? 1 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Today's Progress */}
          <Card className="lg:col-span-2 bg-[#060E20] border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />
            <h2 className="text-lg font-black text-white uppercase tracking-widest mb-8 relative z-10">Progreso de Hoy</h2>
            
            <div className="relative z-10 h-[220px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="gradientEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis 
                    dataKey="hora" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#4b5563', fontSize: 8, fontWeight: '900' }} 
                  />
                  <YAxis hide />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fill="url(#gradientEarnings)" 
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="relative z-10 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Meta Diaria</p>
                <p className="text-2xl font-black text-white tracking-tighter mt-1">$420K / <span className="text-emerald-400">$500K</span></p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle 
                    cx="32" cy="32" r="26" fill="none" 
                    stroke="#10B981" 
                    strokeWidth="6" 
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26 * 0.84} ${2 * Math.PI * 26}`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">84%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* === RECENT TRIPS + ACHIEVEMENTS === */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Recent Earnings Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">Últimas Ganancias</h2>
              <Button variant="ghost" className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white">
                Ver Todo <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {recentTrips.map((trip) => (
              <Card key={trip.id} className="bg-white/[0.02] border-white/5 hover:border-emerald-500/20 transition-all duration-300 rounded-[28px] p-6 group cursor-pointer hover:scale-[1.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110",
                      trip.type === 'Express' ? "bg-orange-500/10 border-orange-500/20" :
                      trip.type === 'Compartido' ? "bg-blue-500/10 border-blue-500/20" :
                      "bg-emerald-500/10 border-emerald-500/20"
                    )}>
                      <Truck className={cn(
                        "w-6 h-6",
                        trip.type === 'Express' ? "text-orange-500" :
                        trip.type === 'Compartido' ? "text-blue-500" :
                        "text-emerald-400"
                      )} />
                    </div>
                    <div>
                      <h3 className="text-white font-black text-base tracking-tight">{trip.route}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">
                          {trip.type}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-600 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {trip.time}
                        </span>
                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-400" /> {trip.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">
                      +${trip.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] text-emerald-500 font-black uppercase">Cobrado</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Achievements / Bonuses */}
          <div className="space-y-6">
            <Card className="bg-[#060E20] border-white/5 p-8 rounded-[40px] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
              <h3 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8 relative z-10">Bonificaciones</h3>
              
              <div className="relative z-10 space-y-5">
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 flex items-center gap-5 group hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Medal className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">Racha de 5 días</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Bonus: +$50,000</p>
                  </div>
                  <div className="text-emerald-400 text-lg font-black">✓</div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 flex items-center gap-5 group hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">15 Viajes / Semana</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">Bonus: +$100,000</p>
                  </div>
                  <div className="text-zinc-700 text-xs font-black">12/15</div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-5 flex items-center gap-5 group hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-black text-sm">Hora Pico</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide">x1.5 Multiplicador Activo</p>
                  </div>
                  <div className="text-orange-400 text-lg font-black animate-pulse">⚡</div>
                </div>
              </div>
            </Card>

            {/* Quick Withdraw */}
            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 border-none p-8 rounded-[40px] shadow-2xl relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Retiro Disponible</p>
                <h4 className="text-4xl font-black text-white tracking-tighter mb-4">$1,481,000</h4>
                <Button className="w-full bg-white text-emerald-800 font-black uppercase tracking-widest rounded-2xl h-14 shadow-xl hover:bg-emerald-50 active:scale-95 transition-all text-sm">
                  <Wallet className="w-4 h-4 mr-2" />
                  Retirar a Mi Cuenta
                </Button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

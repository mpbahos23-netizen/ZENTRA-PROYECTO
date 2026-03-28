import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin, Users, Truck, AlertTriangle, Activity,
  DollarSign, Package, Shield, TrendingUp, Loader2,
  Flame, BarChart3, Clock, Map as MapIcon, CheckCircle2,
  XCircle, Ban, Eye, Star, Percent, Zap, Radio
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { MapContainer, TileLayer, Circle, Popup, LayerGroup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useFleetTracking } from '@/hooks/useLocationTracking';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// AdminOperations: Expanded for ZENTRA Admin
// ============================================

interface AdminStats {
  totalShipments: number;
  activeShipments: number;
  totalCarriers: number;
  totalRevenue: number;
  dailyRevenue: number;
  activeDrivers: number;
  activeClients: number;
}

interface DemandPoint {
  zone: string;
  count: number;
  lat: number;
  lng: number;
  intensity: number;
}

const ZONE_COORDS: Record<string, [number, number]> = {
  'Lima': [-12.0464, -77.0428],
  'Ica': [-14.0678, -75.7286],
  'Arequipa': [-16.4090, -71.5375],
  'Trujillo': [-8.1091, -79.0269],
  'Piura': [-5.1945, -80.6328],
  'Cusco': [-13.5319, -71.9675],
  'Ciudad de México': [19.4326, -99.1332],
  'Monterrey': [25.6866, -100.3161],
};

const TRUCK_ICON = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774270.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function AdminOperations() {
  const [stats, setStats] = useState<AdminStats>({
    totalShipments: 0,
    activeShipments: 0,
    totalCarriers: 0,
    totalRevenue: 0,
    dailyRevenue: 0,
    activeDrivers: 0,
    activeClients: 0,
  });
  const [demandData, setDemandData] = useState<DemandPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'carriers' | 'shipments' | 'demand' | 'payments' | 'live_fleet'>('overview');
  
  // Real-time Fleet Data
  const { carriers, loading: fleetLoading } = useFleetTracking();
  
  // Data lists
  const [shipments, setShipments] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  // Pricing config
  const [pricePerKm, setPricePerKm] = useState(1.5);
  const [platformFee, setPlatformFee] = useState(15);

  const fetchData = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0,0,0,0);

    const [shipmentsRes, profilesRes, paymentsRes, driversRes] = await Promise.all([
      supabase.from('shipments').select('*, client:profiles!shipments_client_id_fkey(full_name), carrier:profiles!shipments_carrier_id_fkey(full_name)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('payments').select('*').order('created_at', { ascending: false }),
      supabase.from('drivers').select('*, carrier:profiles(full_name)').order('created_at', { ascending: false }),
    ]);

    const allShipments = shipmentsRes.data || [];
    const allProfiles = profilesRes.data || [];
    const allPayments = paymentsRes.data || [];
    const allDrivers = driversRes.data || [];

    if (shipmentsRes.error) toast.error("Error al cargar envíos");
    if (driversRes.error) toast.error("Error al cargar conductores");

    const activeShipmentsCount = allShipments.filter(s => ['searching', 'accepted', 'in_transit'].includes(s.status)).length;
    const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const dailyRevenue = allPayments.filter(p => new Date(p.created_at) >= today).reduce((sum, p) => sum + Number(p.amount), 0);
    
    // Process Demand Heatmap Data
    const zoneCounts: Record<string, number> = {};
    allShipments.forEach(s => {
      if (!s.origin) return; // Guard for null origins
      const matchedZone = Object.keys(ZONE_COORDS).find(z => s.origin.toLowerCase().includes(z.toLowerCase())) || 'Lima';
      zoneCounts[matchedZone] = (zoneCounts[matchedZone] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(zoneCounts), 1);
    const processedDemand: DemandPoint[] = Object.entries(ZONE_COORDS).map(([zone, coords]) => ({
      zone,
      count: zoneCounts[zone] || 0,
      lat: coords[0],
      lng: coords[1],
      intensity: (zoneCounts[zone] || 0) / maxCount
    }));

    setShipments(allShipments);
    setDrivers(allDrivers);
    setPayments(allPayments);
    setDemandData(processedDemand);
    setStats({
      totalShipments: allShipments.length,
      activeShipments: activeShipmentsCount,
      totalCarriers: allProfiles.filter(p => p.role === 'carrier').length,
      totalRevenue,
      dailyRevenue,
      activeDrivers: allDrivers.filter(d => d.status === 'active' || d.status === 'available').length,
      activeClients: allProfiles.filter(p => p.role === 'client').length,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateShipment = async (id: string, status: string) => {
    const { error } = await supabase.from('shipments').update({ status }).eq('id', id);
    if (error) toast.error("Error al actualizar despacho");
    else {
      if (status === 'cancelled') {
        toast.warning("Cargo por cancelación aplicado: $50.00 (Sin previo aviso)");
      }
      toast.success(`Despacho ${status === 'cancelled' ? 'cancelado' : 'confirmado'}`);
      fetchData();
    }
  };

  const handleUpdateDriver = async (id: string, status: string) => {
    const { error } = await supabase.from('drivers').update({ status }).eq('id', id);
    if (error) toast.error("Error al actualizar conductor");
    else {
      toast.success(`Conductor ${status === 'active' ? 'aprobado' : 'bloqueado'}`);
      fetchData();
    }
  };

  const handleExportCSV = () => {
    if (shipments.length === 0) return toast.error("No hay datos para exportar");
    
    const headers = ["ID", "Cliente", "Origen", "Destino", "Estado", "Precio", "Fecha"];
    const rows = shipments.map(s => [
      s.id,
      s.client?.full_name || "N/A",
      s.origin,
      s.destination,
      s.status,
      s.price,
      new Date(s.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ZENTRA_REPORT_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reporte CSV generado correctamente");
  };

  const statCards = [
    { label: 'Viajes del Día', value: shipments.filter(s => new Date(s.created_at) >= new Date(new Date().setHours(0,0,0,0))).length, icon: Package, color: 'text-[#00e5ff]', bgColor: 'bg-[#00e5ff]/10' },
    { label: 'Ingresos Hoy', value: `$${stats.dailyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { label: 'Conductores Activos', value: stats.activeDrivers, icon: Users, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
    { label: 'Clientes Registrados', value: stats.activeClients, icon: Shield, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-1 uppercase italic">ZENTRA OPS <span className="text-[#00e5ff] text-2xl font-black">2.0</span></h1>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                Control de Flota y Operación en Vivo 
            </p>
          </div>
          <div className="flex gap-3">
             <Button onClick={() => fetchData()} disabled={loading} className="rounded-2xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest h-12 px-6">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sincronizar Datos"}
             </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(stat => (
            <Card key={stat.label} className="bg-[#0a0a0a] border-white/5 rounded-[32px] p-6 shadow-2xl relative overflow-hidden group hover:border-[#00e5ff]/30 transition-all">
              <div className={`absolute -top-12 -right-12 w-32 h-32 blur-3xl rounded-full opacity-10 group-hover:opacity-30 transition-opacity ${stat.bgColor}`} />
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center border border-white/5 shadow-inner`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
              <p className="text-4xl font-black text-white tracking-tighter leading-none">
                {stat.value}
              </p>
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-3">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#0a0a0a] rounded-3xl border border-white/5 w-fit shadow-2xl">
          {[
            { key: 'overview', label: 'Dashboard', icon: Activity },
            { key: 'shipments', label: 'Gestión Viajes', icon: Package },
            { key: 'live_fleet', label: 'Flota en Vivo', icon: Radio },
            { key: 'carriers', label: 'Conductores', icon: Truck },
            { key: 'payments', label: 'Precios y Pagos', icon: DollarSign },
            { key: 'demand', label: 'Zonas Activas', icon: Flame },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                  "flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.key
                    ? "bg-[#00e5ff] text-black shadow-xl shadow-[#00e5ff]/20 scale-105"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/5 rounded-[40px] p-10 shadow-3xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Flujo de Ingresos</h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Recaudación total de la plataforma</p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-black text-emerald-400">+22.4%</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { day: 'Lun', r: 12000 }, { day: 'Mar', r: 15400 }, { day: 'Mié', r: 13900 }, { day: 'Jue', r: 18200 }, { day: 'Vie', r: 24500 }, { day: 'Sáb', r: 21000 }, { day: 'Dom', r: 14000 }
                  ]}>
                    <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #1ed1e6', borderRadius: 20, padding: 16 }} />
                    <Line type="stepAfter" dataKey="r" stroke="#00e5ff" strokeWidth={5} dot={{ fill: '#00e5ff', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="bg-[#0a0a0a] border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-3xl">
                <h3 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-10">Ocupación de Red</h3>
                <div className="relative w-full aspect-square max-w-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'En Tránsito', value: stats.activeShipments, color: '#00e5ff' },
                                    { name: 'Libres', value: stats.activeDrivers - stats.activeShipments, color: '#222' },
                                ]}
                                innerRadius={70} outerRadius={100} paddingAngle={10} dataKey="value" stroke="none"
                            >
                                <Cell fill="#00e5ff" />
                                <Cell fill="#1a1a1a" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{Math.round((stats.activeShipments / (stats.activeDrivers || 1)) * 100)}%</span>
                        <span className="text-[10px] text-zinc-600 font-black uppercase">Uso de Flota</span>
                    </div>
                </div>
                <div className="w-full mt-10 space-y-3">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#00e5ff]" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase">Conductores en Viaje</span>
                        </div>
                        <span className="text-white font-black">{stats.activeShipments}</span>
                    </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'shipments' && (
            <Card className="bg-[#0a0a0a] border-white/5 rounded-[40px] overflow-hidden shadow-3xl">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#0d0d0d]">
                <h3 className="text-xl font-black text-white uppercase italic">Consola de Despachos</h3>
                <div className="flex gap-4">
                  <Button onClick={handleExportCSV} variant="outline" className="border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-white hover:text-black transition-all">
                    Exportar Data (CSV)
                  </Button>
                  <Badge className="bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20 px-4 py-2 rounded-xl text-[10px] font-black">{shipments.length} REGISTROS</Badge>
                </div>
              </div>
              <Table>
                <TableHeader className="bg-white/2">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px] h-14 pl-10">Cliente</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Ruta</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Estado</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Precio</TableHead>
                    <TableHead className="text-zinc-600 font-black uppercase text-[9px] text-right pr-10">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((s) => (
                    <TableRow key={s.id} className="border-white/5 hover:bg-white/2">
                      <TableCell className="pl-10">
                        <p className="text-white font-bold text-sm tracking-tight">{s.client?.full_name || 'Usuario Movix'}</p>
                        <p className="text-[10px] text-zinc-600 font-bold uppercase">{new Date(s.created_at).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                            <span className="text-xs text-zinc-300 font-bold tracking-tight">{s.origin}</span>
                            <span className="text-[9px] text-zinc-600 font-black uppercase mt-1">→ {s.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest rounded-lg px-2 py-1",
                            s.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            s.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                         )}>
                            {s.status}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-white font-black text-sm tracking-tighter">${s.price?.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-10">
                         <div className="flex justify-end gap-2">
                            {s.status === 'pending' && (
                                <Button onClick={() => handleUpdateShipment(s.id, 'accepted')} size="sm" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl h-9 px-4">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar
                                </Button>
                            )}
                            {s.status !== 'cancelled' && s.status !== 'delivered' && (
                                <Button onClick={() => handleUpdateShipment(s.id, 'cancelled')} size="sm" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl h-9 px-4">
                                    <Ban className="w-4 h-4 mr-2" /> Cancelar
                                </Button>
                            )}
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {activeTab === 'carriers' && (
            <div className="grid lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3 bg-[#0a0a0a] border-white/5 rounded-[40px] shadow-3xl overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xl font-black text-white uppercase italic">Control de Conductores</h3>
                        <Button className="bg-[#00e5ff] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl h-12 px-8 shadow-lg shadow-[#00e5ff]/20">Registrar Nuevo</Button>
                    </div>
                    <Table>
                        <TableHeader className="bg-white/2">
                            <TableRow className="border-white/5">
                                <TableHead className="text-zinc-600 font-black uppercase text-[9px] h-14 pl-10">Conductor</TableHead>
                                <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Licencia / Docs</TableHead>
                                <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Calificación</TableHead>
                                <TableHead className="text-zinc-600 font-black uppercase text-[9px]">Estado</TableHead>
                                <TableHead className="text-zinc-600 font-black uppercase text-[9px] text-right pr-10">Accion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.map(d => (
                                <TableRow key={d.id} className="border-white/5 hover:bg-white/2">
                                    <TableCell className="pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/100?u=${d.id}`} alt="" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{d.full_name}</p>
                                                <p className="text-[10px] text-zinc-600 font-black uppercase">{d.carrier?.full_name || 'Afiliado Movix'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-[8px] font-black border-white/10 text-zinc-400 px-3 py-1 uppercase">{d.license}</Badge>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg bg-white/5 text-zinc-500"><Eye className="w-4 h-4" /></Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("w-3 h-3", i < Math.floor(d.rating || 5) ? "text-amber-400 fill-amber-400" : "text-zinc-800")} />
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase px-2 py-1 rounded-lg",
                                            d.status === 'active' ? 'bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        )}>
                                            {d.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-10">
                                        <Button onClick={() => handleUpdateDriver(d.id, d.status === 'active' ? 'blocked' : 'active')} variant="ghost" className={cn("text-xs font-black uppercase tracking-widest", d.status === 'active' ? 'text-red-500' : 'text-emerald-500')}>
                                            {d.status === 'active' ? 'Bloquear' : 'Aprobar'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-[#00e5ff]/20 to-transparent border border-[#00e5ff]/20 rounded-[40px] p-8 shadow-2xl">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-6">Verificación Express</h4>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase leading-relaxed mb-6 italic">Hay **4 conductores** esperando revisión de documentos regulatorios.</p>
                        <Button className="w-full bg-[#00e5ff] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl h-14">Revisar Cola</Button>
                    </Card>
                </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-[#0a0a0a] border-white/5 rounded-[40px] p-10 shadow-3xl">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white uppercase italic">Configuración de Tarifas</h3>
                        <Zap className="w-6 h-6 text-[#00e5ff]" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-2">Precio Base por KM ($)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#00e5ff]">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <Input value={pricePerKm} onChange={e => setPricePerKm(Number(e.target.value))} className="bg-white/2 border-white/5 h-16 rounded-[24px] pl-14 text-xl font-black text-white focus:ring-[#00e5ff] focus:border-[#00e5ff]" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pl-2">Comisión Plataforma (%)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#00e5ff]">
                                    <Percent className="w-5 h-5" />
                                </div>
                                <Input value={platformFee} onChange={e => setPlatformFee(Number(e.target.value))} className="bg-white/2 border-white/5 h-16 rounded-[24px] pl-14 text-xl font-black text-white focus:ring-[#00e5ff] focus:border-[#00e5ff]" />
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => toast.success("SaaS: Tarifas Globales actualizadas con éxito")} className="w-full mt-10 bg-white text-black font-black uppercase text-xs tracking-[0.3em] rounded-3xl h-16 hover:bg-zinc-200 transition-all hover:scale-[1.02] shadow-2xl">Guardar Configuración Global</Button>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-[#0a0a0a] border-white/5 rounded-[40px] p-8 shadow-3xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-3">
                            <Percent className="w-5 h-5 text-purple-400" /> Promociones Activas
                        </h4>
                        <div className="space-y-4">
                            {[
                                { name: 'Buen Fin Logístico', off: '20%', code: 'MX20' },
                                { name: 'Happy Hour (12:00)', off: '15%', code: 'LUNCH' },
                            ].map(p => (
                                <div key={p.code} className="bg-white/2 p-5 rounded-3xl border border-white/5 flex justify-between items-center group cursor-pointer hover:border-purple-500/30 transition-all">
                                    <div>
                                        <p className="text-white font-bold text-sm">{p.name}</p>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">CÓDIGO: {p.code}</p>
                                    </div>
                                    <span className="text-xl font-black text-purple-400">-{p.off}</span>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full border border-dashed border-zinc-800 rounded-3xl h-14 text-[10px] font-black uppercase text-zinc-500 hover:text-white hover:border-white/20 transition-all">+ Nueva Promo</Button>
                        </div>
                    </Card>
                </div>
            </div>
          )}

          {activeTab === 'demand' && (
            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-[#0a0a0a] border-white/5 rounded-[32px] p-8 shadow-3xl">
                        <h3 className="text-white font-black text-xs uppercase tracking-widest mb-8 flex items-center gap-4 italic">
                            <Flame className="w-6 h-6 text-orange-500" />
                            Puntos de Calor
                        </h3>
                        <div className="space-y-6">
                            {demandData.sort((a,b) => b.count - a.count).slice(0, 5).map((point, i) => (
                                <div key={point.zone} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-black text-zinc-800 group-hover:text-[#00e5ff] transition-colors">{i+1}</span>
                                        <p className="text-sm text-white font-bold tracking-tight">{point.zone}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-[#00e5ff] bg-[#00e5ff]/5 px-3 py-1.5 rounded-xl border border-[#00e5ff]/10">
                                        {point.count} VIAJES
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="lg:col-span-3 bg-[#0a0a0a] border-white/5 rounded-[48px] overflow-hidden shadow-3xl relative h-[650px] border border-white/5">
                    <MapContainer 
                        key={activeTab} // Force remount to fix Leaflet initialization issues
                        center={[-12.0464, -77.0428]} 
                        zoom={6} 
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <LayerGroup>
                            {demandData.filter(p => p.lat && p.lng).map((point) => (
                                <Circle 
                                    key={point.zone} 
                                    center={[point.lat, point.lng]} 
                                    radius={40000 + (point.intensity * 60000)}
                                    pathOptions={{
                                        fillColor: point.intensity > 0.7 ? '#ef4444' : point.intensity > 0.4 ? '#f59e0b' : '#00e5ff',
                                        color: 'transparent', 
                                        fillOpacity: 0.4 + (point.intensity * 0.4)
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[120px]">
                                            <p className="font-black uppercase text-[10px] text-zinc-900 leading-tight mb-1">{point.zone}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                                Actividad: <span className="text-black">{point.count} despachos</span>
                                            </p>
                                        </div>
                                    </Popup>
                                </Circle>
                            ))}
                        </LayerGroup>
                    </MapContainer>
                </Card>
            </div>
          )}
          {activeTab === 'live_fleet' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-white uppercase italic">Radar de Flota en Tiempo Real</h3>
                    <div className="flex gap-4">
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase animate-pulse">
                            {Object.keys(carriers).length} CONDUCTORES EN LÍNEA
                        </Badge>
                    </div>
                </div>
                
                <Card className="bg-[#0a0a0a] border-white/5 rounded-[48px] overflow-hidden shadow-3xl relative h-[700px] border border-white/5">
                    <MapContainer 
                        center={[-12.0464, -77.0428]} 
                        zoom={6} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        {Object.entries(carriers).map(([id, data]) => (
                            <Marker 
                                key={id} 
                                position={[data.lat, data.lng]}
                                icon={TRUCK_ICON}
                            >
                                <Popup>
                                    <div className="p-3 min-w-[180px] font-inter">
                                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Piloto Activo</p>
                                        <p className="font-black text-zinc-900 text-sm uppercase mb-3">{data.carrier_name}</p>
                                        <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-100">
                                            <div className="flex justify-between items-center text-[9px] font-bold">
                                                <span className="text-zinc-400 uppercase">Última Señal:</span>
                                                <span className="text-zinc-800">{new Date(data.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] font-bold">
                                                <span className="text-zinc-400 uppercase">Coordenadas:</span>
                                                <span className="text-zinc-800">{data.lat.toFixed(4)}, {data.lng.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

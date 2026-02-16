import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Clock, TrendingUp, Plus, Loader2, PieChart as PieChartIcon, AreaChart as AreaChartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClientDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: shipments, error } = await supabase
        .from("shipments")
        .select(`
          *,
          carrier:carrier_id(full_name)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mock data for spending trend
      const spendingData = [
        { name: 'Ene', amount: 2400 },
        { name: 'Feb', amount: 5200 },
        { name: 'Mar', amount: 3800 },
        { name: 'Abr', amount: 6700 },
      ];

      return { shipments, spendingData };
    },
  });

  const shipments = dashboardData?.shipments || [];

  const stats = {
    active: shipments.filter(s => s.status === "in_transit" || s.status === "pending").length,
    totalSpent: shipments.reduce((acc, s) => acc + (Number(s.price) || 0), 0),
    totalShipments: shipments.length,
  };

  return (
    <DashboardLayout role="client">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Escala tu Logística</h1>
            <p className="text-muted-foreground">Optimiza tus operaciones con datos inteligentes.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/quote">Cotizar</Link>
            </Button>
            <Button asChild className="bg-teal-gradient hover:opacity-90">
              <Link to="/quote">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Envío
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Envíos Activos" value={stats.active.toString()} change="En tránsito / Pendientes" changeType="neutral" />
          <StatCard icon={DollarSign} label="Presupuesto Utilizado" value={`$${stats.totalSpent.toLocaleString()}`} change="Histórico total" changeType="positive" />
          <StatCard icon={PieChartIcon} label="Eficiencia" value="92%" change="+4% este trimestre" changeType="positive" />
          <StatCard icon={TrendingUp} label="Crecimiento de Red" value="+15" change="Nuevas rutas" changeType="neutral" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Spending Area Chart */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AreaChartIcon className="w-4 h-4 text-teal" />
                Evolución de Gasto Logístico
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.spendingData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal" />
                KPIs de Rendimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Tiempo de Entrega", value: "2.4 d", desc: "Promedio regional" },
                { label: "Ahorro por Consolidación", value: "$1,240", desc: "Este mes" },
                { label: "SLA de Transportistas", value: "98.5%", desc: "Cumplimiento de contrato" },
              ].map((kpi) => (
                <div key={kpi.label} className="p-3 rounded-lg border border-border/50 bg-black/20">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{kpi.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-xl font-bold text-foreground">{kpi.value}</span>
                    <span className="text-xs text-teal">{kpi.desc}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Envíos Recientes</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-teal" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Transportista</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Llegada Estimada</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments?.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.id.slice(0, 8)}</TableCell>
                        <TableCell>{(s.carrier as any)?.full_name || "Pendiente"}</TableCell>
                        <TableCell>{s.destination}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {s.eta ? new Date(s.eta).toLocaleDateString() : "Por asignar"}
                        </TableCell>
                        <TableCell className="font-medium">${Number(s.price).toLocaleString()}</TableCell>
                        <TableCell><ShipmentStatusBadge status={s.status} /></TableCell>
                      </TableRow>
                    ))}
                    {shipments?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No tienes envíos registrados. Comienza cotizando uno.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;

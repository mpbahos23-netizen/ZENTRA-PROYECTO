import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Package, Star, Clock, TrendingUp, AlertTriangle, Loader2, LineChart as LineChartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CarrierDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["carrier-dashboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: shipments, error } = await supabase
        .from("shipments")
        .select("*")
        .or(`status.eq.pending,carrier_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Mock data for line chart (simulating revenue growth)
      const revenueData = [
        { name: 'Lun', revenue: 400 },
        { name: 'Mar', revenue: 300 },
        { name: 'Mie', revenue: 600 },
        { name: 'Jue', revenue: 800 },
        { name: 'Vie', revenue: 500 },
        { name: 'Sab', revenue: 900 },
        { name: 'Dom', revenue: 1100 },
      ];

      return { shipments, profile, revenueData };
    },
  });

  const shipments = dashboardData?.shipments || [];
  const profile = dashboardData?.profile;

  const stats = {
    earnings: shipments.filter(s => s.status === "delivered").reduce((acc, s) => acc + (Number(s.price) || 0), 0) * 0.92,
    active: shipments.filter(s => s.status === "in_transit" || s.status === "accepted").length,
    completed: shipments.filter(s => s.status === "delivered").length,
  };

  return (
    <DashboardLayout role="carrier">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Ganancias (Estimadas)" value={`$${stats.earnings.toLocaleString()}`} change="Después de comisión" changeType="positive" />
          <StatCard icon={Package} label="Envíos Activos" value={stats.active.toString()} change="En curso por ti" changeType="neutral" />
          <StatCard icon={Star} label="Reputación" value={`${profile?.rating || '5.0'} ★`} change={`${profile?.total_reviews || 0} reseñas`} changeType="positive" />
          <StatCard icon={TrendingUp} label="Tendencia" value="+18%" change="Este mes" changeType="positive" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-teal" />
                Crecimiento de Ingresos Semanales
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData?.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#2dd4bf' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2dd4bf" strokeWidth={3} dot={{ fill: '#2dd4bf', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Efficiency card */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Eficiencia Operativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { icon: Clock, label: "Entrega a Tiempo", value: "98.2%", color: "text-success" },
                { icon: Package, label: "Carga Promedio", value: "2.4 ton", color: "text-foreground" },
                { icon: AlertTriangle, label: "Alertas de Ruta", value: "0", color: "text-success" },
                { icon: Star, label: "Nivel de Servicio", value: "Elite", color: "text-teal" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <m.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{m.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipments table */}
          <Card className="lg:col-span-3 border-border/50">
            <CardHeader className="pb-3 text-center sm:text-left">
              <CardTitle className="text-base font-semibold">Mercado y Mis Envíos</CardTitle>
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
                      <TableHead>Ruta</TableHead>
                      <TableHead>Peso</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments?.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.id.slice(0, 8)}</TableCell>
                        <TableCell className="text-sm">
                          <span className="text-foreground">{s.origin}</span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="text-foreground">{s.destination}</span>
                        </TableCell>
                        <TableCell>{s.weight} kg</TableCell>
                        <TableCell className="font-medium">${Number(s.price).toLocaleString()}</TableCell>
                        <TableCell><ShipmentStatusBadge status={s.status} /></TableCell>
                      </TableRow>
                    ))}
                    {shipments?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No hay envíos disponibles en este momento.
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

export default CarrierDashboard;

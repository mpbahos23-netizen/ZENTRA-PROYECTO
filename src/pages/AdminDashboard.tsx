import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Truck, Package, Users, Loader2, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [shipmentsRes, profilesRes] = await Promise.all([
        supabase.from("shipments").select("*"),
        supabase.from("profiles").select("*")
      ]);

      if (shipmentsRes.error) throw shipmentsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const shipments = shipmentsRes.data;
      const profiles = profilesRes.data;

      const totalRevenue = shipments.reduce((acc, s) => acc + (Number(s.price) || 0), 0);
      const platformsEarnings = totalRevenue * 0.08;
      const carriers = profiles.filter(p => p.role === "carrier");
      const clients = profiles.filter(p => p.role === "client");

      // Group shipments by date for chart
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const chartData = last7Days.map(date => ({
        name: new Date(date).toLocaleDateString('es-ES', { weekday: 'short' }),
        envíos: shipments.filter(s => s.created_at.startsWith(date)).length,
      }));

      return {
        totalRevenue,
        platformsEarnings,
        carrierCount: carriers.length,
        clientCount: clients.length,
        shipmentCount: shipments.length,
        chartData
      };
    },
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Control de Mando Global</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-teal/20 text-teal">Modo Escalabilidad Activo</Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-12 h-12 animate-spin text-teal" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={DollarSign} label="Volumen Total" value={`$${stats?.totalRevenue.toLocaleString()}`} change="Volumen de transacciones" changeType="neutral" />
              <StatCard icon={BarChart3} label="Ingresos Plataforma" value={`$${stats?.platformsEarnings.toLocaleString()}`} change="8% de comisión" changeType="positive" />
              <StatCard icon={Truck} label="Transportistas" value={stats?.carrierCount.toString() || "0"} change="Flota disponible" changeType="neutral" />
              <StatCard icon={Package} label="Envíos Totales" value={stats?.shipmentCount.toString() || "0"} change="Procesados históricamente" changeType="neutral" />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Activity Chart */}
              <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal" />
                    Actividad de los Últimos 7 Días
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#2dd4bf' }}
                      />
                      <Bar dataKey="envíos" fill="#2dd4bf" radius={[4, 4, 0, 0]}>
                        {stats?.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fillOpacity={0.8 + (index * 0.03)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Config */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Métricas de Crecimiento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Usuarios Totales", value: stats?.clientCount + stats?.carrierCount, desc: "Crecimiento del ecosistema" },
                    { label: "Tasa de Retención", value: "94%", desc: "Usuarios activos recurrentes" },
                    { label: "Ticket Promedio", value: `$${(stats?.totalRevenue / (stats?.shipmentCount || 1)).toFixed(2)}`, desc: "Valor por envío" },
                    { label: "Configuración SaaS", value: "Activa", desc: "Plan Enterprise habilitado" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-black/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                      <span className="text-sm font-semibold text-teal">{s.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

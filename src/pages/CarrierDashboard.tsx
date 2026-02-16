import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Package, Star, Clock, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const CarrierDashboard = () => {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["carrier-shipments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch shipments either pending (available) or assigned to this carrier
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .or(`status.eq.pending,carrier_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const stats = shipments ? {
    earnings: shipments.filter(s => s.status === "delivered").reduce((acc, s) => acc + (Number(s.price) || 0), 0) * 0.92, // 92% for carrier
    active: shipments.filter(s => s.status === "in_transit" || s.status === "accepted").length,
    completed: shipments.filter(s => s.status === "delivered").length,
  } : { earnings: 0, active: 0, completed: 0 };

  return (
    <DashboardLayout role="carrier">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Ganancias (Estimadas)" value={`$${stats.earnings.toLocaleString()}`} change="Después de comisión" changeType="positive" />
          <StatCard icon={Package} label="Envíos Activos" value={stats.active.toString()} change="En curso por ti" changeType="neutral" />
          <StatCard icon={Clock} label="Envíos Disponibles" value={shipments?.filter(s => s.status === "pending").length.toString() || "0"} change="En el mercado" changeType="positive" />
          <StatCard icon={Star} label="Calificación" value="4.8 ★" change="Reputación actual" changeType="neutral" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Shipments table */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Mercado y Mis Envíos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-teal" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
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

          {/* Performance */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Rendimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { icon: Clock, label: "Entrega a Tiempo", value: "96.4%", color: "text-success" },
                { icon: Package, label: "Total Completados", value: stats.completed.toString(), color: "text-foreground" },
                { icon: Star, label: "Calificación Promedio", value: "4.8 / 5.0", color: "text-warning" },
                { icon: AlertTriangle, label: "Incidentes", value: "0", color: "text-destructive" },
                { icon: TrendingUp, label: "Tendencia de Ingresos", value: "+18%", color: "text-success" },
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CarrierDashboard;

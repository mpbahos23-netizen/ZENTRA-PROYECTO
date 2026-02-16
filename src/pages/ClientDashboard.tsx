import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Clock, TrendingUp, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const ClientDashboard = () => {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["client-shipments"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("shipments")
        .select(`
          *,
          carrier:carrier_id(full_name)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const stats = shipments ? {
    active: shipments.filter(s => s.status === "in_transit" || s.status === "pending").length,
    totalSpent: shipments.reduce((acc, s) => acc + (Number(s.price) || 0), 0),
    totalShipments: shipments.length,
  } : { active: 0, totalSpent: 0, totalShipments: 0 };

  return (
    <DashboardLayout role="client">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo</h1>
            <p className="text-muted-foreground">Aquí tienes un resumen de tus envíos.</p>
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
          <StatCard icon={DollarSign} label="Total Invertido" value={`$${stats.totalSpent.toLocaleString()}`} change="Histórico total" changeType="positive" />
          <StatCard icon={Clock} label="Envíos Totales" value={stats.totalShipments.toString()} change="Completados y activos" changeType="neutral" />
          <StatCard icon={TrendingUp} label="Crecimiento" value="+12%" change="Este mes" changeType="positive" />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Envíos Recientes</CardTitle>
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
    </DashboardLayout>
  );
};

export default ClientDashboard;

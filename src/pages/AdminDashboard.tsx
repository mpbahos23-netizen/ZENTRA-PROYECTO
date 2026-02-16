import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Truck, Package, Users, Check, X } from "lucide-react";

const pendingCarriers = [
  { id: 1, name: "BlueRoute Logistics", email: "ops@blueroute.com", trucks: 5, date: "Feb 14, 2026" },
  { id: 2, name: "SwiftHaul Co.", email: "admin@swifthaul.com", trucks: 3, date: "Feb 15, 2026" },
  { id: 3, name: "PrimeFreight", email: "info@primefreight.com", trucks: 12, date: "Feb 16, 2026" },
];

const AdminDashboard = () => (
  <DashboardLayout role="admin">
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Vista General de la Plataforma</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Ingresos Totales" value="$284,500" change="+22% este mes" changeType="positive" />
        <StatCard icon={Truck} label="Transportistas Activos" value="48" change="3 pendientes de aprobación" changeType="neutral" />
        <StatCard icon={Package} label="Envíos (Mes)" value="1,247" change="+15% vs mes anterior" changeType="positive" />
        <StatCard icon={Users} label="Total Clientes" value="312" change="28 nuevos este mes" changeType="positive" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Approval queue */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Cola de Aprobación de Transportistas</CardTitle>
              <Badge variant="secondary" className="text-xs">{pendingCarriers.length} pendientes</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingCarriers.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.email} · {c.trucks} camiones · Solicitado el {c.date}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-teal-gradient hover:opacity-90 h-8">
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Configuración de la Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Tasa de Comisión por Defecto", value: "8%", desc: "Aplicada a todos los envíos nuevos" },
              { label: "Aprobación de Transportistas", value: "Manual", desc: "Requiere revisión del administrador" },
              { label: "Requisito de Seguro", value: "Opcional", desc: "Por envío individual" },
              { label: "Suscripciones Activas", value: "48", desc: "Básico: 28 · Pro: 16 · Enterprise: 4" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
);

export default AdminDashboard;

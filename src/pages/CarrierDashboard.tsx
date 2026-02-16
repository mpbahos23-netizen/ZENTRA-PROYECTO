import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Package, Star, Clock, TrendingUp, AlertTriangle } from "lucide-react";

const mockShipments = [
  { id: "SH-2401", origin: "Houston, TX", destination: "Dallas, TX", status: "in_transit" as const, weight: "2,400 kg", price: "$1,240" },
  { id: "SH-2402", origin: "Austin, TX", destination: "San Antonio, TX", status: "pending" as const, weight: "800 kg", price: "$520" },
  { id: "SH-2403", origin: "Miami, FL", destination: "Orlando, FL", status: "delivered" as const, weight: "3,100 kg", price: "$1,890" },
  { id: "SH-2404", origin: "Chicago, IL", destination: "Indianapolis, IN", status: "accepted" as const, weight: "1,600 kg", price: "$980" },
  { id: "SH-2405", origin: "Los Angeles, CA", destination: "Phoenix, AZ", status: "delivered" as const, weight: "4,200 kg", price: "$2,350" },
];

const CarrierDashboard = () => (
  <DashboardLayout role="carrier">
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Monthly Earnings" value="$12,480" change="+12% vs last month" changeType="positive" />
        <StatCard icon={Package} label="Active Shipments" value="8" change="3 in transit" changeType="neutral" />
        <StatCard icon={Clock} label="On-Time Rate" value="96.4%" change="+2.1% improvement" changeType="positive" />
        <StatCard icon={Star} label="Rating" value="4.8 ★" change="Based on 142 reviews" changeType="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Shipments table */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockShipments.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell className="text-sm">
                      <span className="text-foreground">{s.origin}</span>
                      <span className="text-muted-foreground"> → </span>
                      <span className="text-foreground">{s.destination}</span>
                    </TableCell>
                    <TableCell>{s.weight}</TableCell>
                    <TableCell className="font-medium">{s.price}</TableCell>
                    <TableCell><ShipmentStatusBadge status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { icon: Clock, label: "On-Time Delivery", value: "96.4%", color: "text-success" },
              { icon: Package, label: "Total Completed", value: "142", color: "text-foreground" },
              { icon: Star, label: "Avg. Rating", value: "4.8 / 5.0", color: "text-warning" },
              { icon: AlertTriangle, label: "Incidents", value: "2", color: "text-destructive" },
              { icon: TrendingUp, label: "Revenue Trend", value: "+18%", color: "text-success" },
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

export default CarrierDashboard;

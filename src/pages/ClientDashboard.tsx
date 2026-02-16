import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, Clock, TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const mockShipments = [
  { id: "SH-2401", carrier: "FastHaul Inc.", destination: "Dallas, TX", status: "in_transit" as const, eta: "Feb 16, 3:00 PM", price: "$1,240" },
  { id: "SH-2398", carrier: "TransCo", destination: "San Antonio, TX", status: "delivered" as const, eta: "Delivered", price: "$520" },
  { id: "SH-2395", carrier: "ExpressFleet", destination: "Orlando, FL", status: "delivered" as const, eta: "Delivered", price: "$1,890" },
  { id: "SH-2410", carrier: "Pending", destination: "Phoenix, AZ", status: "pending" as const, eta: "Awaiting carrier", price: "$2,350" },
];

const ClientDashboard = () => (
  <DashboardLayout role="client">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground">Here's an overview of your shipments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/quote">Get Quote</Link>
          </Button>
          <Button asChild className="bg-teal-gradient hover:opacity-90">
            <Link to="/client/book">
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Active Shipments" value="3" change="1 in transit" changeType="neutral" />
        <StatCard icon={DollarSign} label="This Month" value="$5,200" change="+8% vs last month" changeType="positive" />
        <StatCard icon={Clock} label="Avg. Delivery Time" value="2.4 days" change="-0.3 days improvement" changeType="positive" />
        <StatCard icon={TrendingUp} label="Total Shipments" value="47" change="This year" changeType="neutral" />
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockShipments.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell>{s.carrier}</TableCell>
                  <TableCell>{s.destination}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.eta}</TableCell>
                  <TableCell className="font-medium">{s.price}</TableCell>
                  <TableCell><ShipmentStatusBadge status={s.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default ClientDashboard;

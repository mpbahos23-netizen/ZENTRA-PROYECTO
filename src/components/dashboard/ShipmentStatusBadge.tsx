import { cn } from "@/lib/utils";

type ShipmentStatus = "pending" | "accepted" | "in_transit" | "delivered" | "cancelled";

const statusConfig: Record<ShipmentStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/15 text-warning border-warning/20" },
  accepted: { label: "Accepted", className: "bg-primary/10 text-primary border-primary/20" },
  in_transit: { label: "In Transit", className: "bg-secondary/15 text-secondary border-secondary/30" },
  delivered: { label: "Delivered", className: "bg-success/15 text-success border-success/20" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const ShipmentStatusBadge = ({ status }: { status: ShipmentStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", config.className)}>
      {config.label}
    </span>
  );
};

export default ShipmentStatusBadge;

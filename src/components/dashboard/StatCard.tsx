import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
}

const StatCard = ({ label, value, change, changeType = "neutral", icon: Icon }: StatCardProps) => (
  <Card className="border-border/50">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <p className={cn(
              "text-xs font-medium mt-1",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-teal" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;

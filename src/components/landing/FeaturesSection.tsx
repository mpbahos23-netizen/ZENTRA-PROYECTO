import { MapPin, Shield, Calculator, Star, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "GPS tracking with live map visualization, geo-fencing alerts, and delivery ETAs.",
  },
  {
    icon: Shield,
    title: "Trust Infrastructure",
    description: "Verified carriers, insurance coverage options, and digital signature confirmation.",
  },
  {
    icon: Calculator,
    title: "Smart Pricing Engine",
    description: "Transparent, instant quotes with full price breakdown — distance, weight, cargo type, urgency.",
  },
  {
    icon: Star,
    title: "Reputation System",
    description: "On-time delivery rates, customer ratings, and professional performance badges.",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Revenue tracking, performance metrics, and operational insights at a glance.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Real-time status updates, delay alerts, and delivery confirmations.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-gradient-teal">Move Forward</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Professional tools for carriers and shippers — built for reliability.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/50 hover:border-teal/30 transition-all duration-300 hover:shadow-card-hover"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mb-4 group-hover:bg-teal/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Basic",
    price: "$49",
    description: "For independent carriers getting started.",
    features: ["Basic shipment tracking", "Standard smart quotes", "Performance metrics", "Email support"],
    cta: "Start Basic",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$149",
    description: "For growing operations that need more power.",
    features: ["Advanced analytics", "Insurance tools", "AI operations assistant", "Priority support", "Multi-truck overview"],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For fleets and large-scale logistics.",
    features: ["Multi-truck management", "API access", "Custom commission rates", "Dedicated account manager", "SLA guarantee"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scale your operations with a plan that fits. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative transition-all duration-300 ${
                tier.highlighted
                  ? "border-teal shadow-glow-teal scale-[1.02]"
                  : "border-border/50 hover:border-teal/30"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-gradient rounded-full text-xs font-semibold text-accent-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-4 pt-8">
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${tier.highlighted ? "bg-teal-gradient hover:opacity-90" : ""}`}
                  variant={tier.highlighted ? "default" : "outline"}
                >
                  <Link to="/signup">{tier.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

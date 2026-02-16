import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Básico",
    price: "$49",
    description: "Para transportistas independientes que están comenzando.",
    features: ["Seguimiento básico de envíos", "Cotizaciones inteligentes estándar", "Métricas de rendimiento", "Soporte por correo electrónico"],
    cta: "Comenzar Básico",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$149",
    description: "Para operaciones en crecimiento que necesitan más potencia.",
    features: ["Análisis avanzados", "Herramientas de seguros", "Asistente de operaciones IA", "Soporte prioritario", "Vista multi-camiones"],
    cta: "Comenzar Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    description: "Para flotas y logística de gran escala.",
    features: ["Gestión multi-camiones", "Acceso a API", "Tasas de comisión personalizadas", "Gestor de cuenta dedicado", "Garantía de SLA"],
    cta: "Contactar Ventas",
    highlighted: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Precios Simples y Trasparentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Escala tus operaciones con un plan que se ajuste a ti. Sin tarifas ocultas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative transition-all duration-300 ${tier.highlighted
                ? "border-teal shadow-glow-teal scale-[1.02]"
                : "border-border/50 hover:border-teal/30"
                }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-gradient rounded-full text-xs font-semibold text-accent-foreground">
                  Más Popular
                </div>
              )}
              <CardHeader className="pb-4 pt-8">
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                  {tier.price !== "Personalizado" && <span className="text-muted-foreground">/mes</span>}
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

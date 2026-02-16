import { MapPin, Shield, Calculator, Star, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MapPin,
    title: "Seguimiento en Tiempo Real",
    description: "Rastreo GPS con visualización en mapa, alertas de geovallas y tiempos estimados de llegada.",
  },
  {
    icon: Shield,
    title: "Infraestructura de Confianza",
    description: "Transportistas verificados, opciones de cobertura de seguro y firma digital de confirmación.",
  },
  {
    icon: Calculator,
    title: "Motor de Precios Inteligente",
    description: "Cotizaciones instantáneas y transparentes con desglose completo — distancia, peso y urgencia.",
  },
  {
    icon: Star,
    title: "Sistema de Reputación",
    description: "Tasas de entrega a tiempo, calificaciones de clientes e insignias de rendimiento profesional.",
  },
  {
    icon: TrendingUp,
    title: "Panel de Análisis",
    description: "Seguimiento de ingresos, métricas de rendimiento y perspectivas operativas de un vistazo.",
  },
  {
    icon: Bell,
    title: "Notificaciones Inteligentes",
    description: "Actualizaciones de estado en tiempo real, alertas de retrasos y confirmaciones de entrega.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para{" "}
            <span className="text-gradient-teal">avanzar</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Herramientas profesionales para transportistas y expedidores — diseñadas para la confiabilidad.
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

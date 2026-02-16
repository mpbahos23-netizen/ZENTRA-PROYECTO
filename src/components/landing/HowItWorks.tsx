import { UserPlus, Route, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up as a carrier or corporate client. Get verified and access your personalized dashboard in minutes.",
  },
  {
    icon: Route,
    title: "Book & Track Shipments",
    description: "Get instant smart quotes, book shipments, and track every mile in real-time with live status updates.",
  },
  {
    icon: BarChart3,
    title: "Grow Your Operations",
    description: "Leverage performance analytics, reputation scoring, and smart pricing to scale your logistics business.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From sign-up to scaling — three steps to professional logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative text-center group"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-teal/10 flex items-center justify-center group-hover:shadow-glow-teal transition-shadow duration-300">
                <step.icon className="w-10 h-10 text-teal" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  useEffect(() => {
    // Mecanismo Anti-Caché: Forzar recarga en la primera visita de la sesión en móviles
    const hasRefreshed = sessionStorage.getItem('zentra_landing_refreshed');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && !hasRefreshed) {
      sessionStorage.setItem('zentra_landing_refreshed', 'true');
      window.location.reload();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;

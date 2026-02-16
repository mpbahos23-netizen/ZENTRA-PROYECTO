import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";

const Landing = () => (
  <div className="min-h-screen">
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

export default Landing;

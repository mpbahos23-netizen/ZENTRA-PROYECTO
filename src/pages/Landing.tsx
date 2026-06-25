import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";

const Landing = () => {

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;

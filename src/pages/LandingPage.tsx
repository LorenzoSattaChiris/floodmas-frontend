import LandingNav from '../components/landing/LandingNav';
import HeroScene from '../components/landing/HeroScene';
import HeroContent from '../components/landing/HeroContent';
import CrisisSection from '../components/landing/CrisisSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import PlatformPreview from '../components/landing/PlatformPreview';
import MetricsGrid from '../components/landing/MetricsGrid';
import MarketSection from '../components/landing/MarketSection';
import TechSection from '../components/landing/TechSection';
import TeamSection from '../components/landing/TeamSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div id="landing-scroll" className="landing-root">
      <LandingNav />

      {/* Hero: Three.js background + overlay content */}
      <section id="hero" className="landing-hero">
        <HeroScene />
        <HeroContent />
      </section>

      <CrisisSection />
      <ProblemSection />
      <SolutionSection />
      <PlatformPreview />
      <MetricsGrid />
      <MarketSection />
      <TechSection />
      <TeamSection />
      <CTASection />
      <Footer />
    </div>
  );
}

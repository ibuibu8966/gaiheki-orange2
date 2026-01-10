import HeroSection from "./components/HeroSection";
import AboutServiceSection from "./components/AboutServiceSection";
import DiagnosisForm from "./components/DiagnosisForm";
import ServiceAreasSection from "./components/ServiceAreasSection";
import CaseStudySection from "./components/CaseStudySection";
import HowToUseSection from "./components/HowToUseSection";
import FAQSection from "./components/FAQSection";
import ColumnSection from "./components/ColumnSection";
import CTASection from "./components/CTASection";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <DiagnosisForm />
      <AboutServiceSection />
      <ServiceAreasSection />
      <CaseStudySection />
      <HowToUseSection />
      <FAQSection />
      <ColumnSection />
      <CTASection />
    </div>
  );
}

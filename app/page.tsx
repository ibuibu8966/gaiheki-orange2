import HeroSection from "./components/HeroSection";
import AboutServiceSection from "./components/AboutServiceSection";
import DiagnosisForm from "./components/DiagnosisForm";
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
      <HowToUseSection />
      <FAQSection />
      <ColumnSection />
      <CTASection />
    </div>
  );
}

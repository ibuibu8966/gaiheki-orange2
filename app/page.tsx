import HeroSection from "./components/HeroSection";
import AboutServiceSection from "./components/AboutServiceSection";
import DiagnosisForm from "./components/DiagnosisForm";
import HowToUseSection from "./components/HowToUseSection";
import CaseStudySection from "./components/CaseStudySection";
import FAQSection from "./components/FAQSection";
import ColumnSection from "./components/ColumnSection";
import CTASection from "./components/CTASection";
import FloatingPhoneButton from "./components/FloatingPhoneButton";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <DiagnosisForm />
      <AboutServiceSection />
      <HowToUseSection />
      <CaseStudySection />
      <FAQSection />
      <ColumnSection />
      <CTASection />
      <FloatingPhoneButton />
    </div>
  );
}

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../lib/animations';
import { initSmoothScroll, destroySmoothScroll } from '../lib/smoothScroll';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import TrustBar from '../components/TrustBar';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

export default function LandingPage() {
  useEffect(() => {
    const lenis = initSmoothScroll();
    return () => {
      destroySmoothScroll();
      lenis?.destroy();
    };
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <Navbar />
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </motion.div>
  );
}

"use client"

import { useEffect, useState } from 'react';
import HeroSection from '@/components/ui/HeroSection';
import FeaturesSection from '@/components/ui/FeaturesSection';
import TestimonialsSection from '@/components/ui/TestimonialsSection';
import PricingSection from '@/components/ui/PricingSection';
import FAQSection from '@/components/ui/FAQSection';
import CTASection from '@/components/ui/CTASection';
import Footer from '@/components/ui/Footer';
import VideoSection from '@/components/ui/VideoSelection';
import Loader from '@/components/ui/Loader';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <HeroSection />
      <VideoSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
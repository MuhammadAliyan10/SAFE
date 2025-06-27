"use client";

import { HeroSection } from "./components/hero-section";
import { ServicesSection } from "./components/services-section";
import { StatsSection } from "./components/stats-section";
import { CTASection } from "./components/cta-section";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ServicesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

import "./landing.css";

import { LandingNav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy, Stats, ProductShowcase, HowItWorks } from "@/components/landing/Sections";
import { Features } from "@/components/landing/Features";
import { Quotes } from "@/components/landing/Quotes";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LandingMotion } from "@/components/landing/motion";

export default function LandingPage() {
  return (
    <div className="landing-page" data-glass="on">
      <LandingNav />
      <Hero />
      <TrustedBy />
      <Stats />
      <ProductShowcase />
      <Features />
      <HowItWorks />
      <Quotes />
      <FAQ />
      <CTA />
      <Footer />
      <LandingMotion />
    </div>
  );
}

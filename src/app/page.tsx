import { LandingNav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy, Stats, ProductShowcase, HowItWorks } from "@/components/landing/Sections";
import { Features } from "@/components/landing/Features";
import { Quotes } from "@/components/landing/Quotes";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LandingMotion } from "@/components/landing/motion";
import { LandingShell } from "@/components/landing/LandingShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/board");
  }

  return (
    <LandingShell>
      <LandingNav user={session?.user} />
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
    </LandingShell>
  );
}

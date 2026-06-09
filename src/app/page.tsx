import "./landing.css";

import { JetBrains_Mono } from "next/font/google";
import { LandingNav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy, Stats, ProductShowcase, HowItWorks } from "@/components/landing/Sections";
import { Features } from "@/components/landing/Features";
import { Quotes } from "@/components/landing/Quotes";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { LandingMotion } from "@/components/landing/motion";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

// Landing-only fonts. Scoped here (not in the root layout) so app routes
// like /board and /documents don't pay the FCP cost for woff2s they never use.

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/board");
  }

  return (
    <div
      className={cn(
        "landing-page",
        jetbrainsMono.variable
      )}
      data-glass="on"
    >
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
    </div>
  );
}

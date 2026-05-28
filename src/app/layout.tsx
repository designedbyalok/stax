import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Stax — Every job, in its place.",
  description:
    "A calm, single-canvas tracker for everywhere you've applied. Paste a link, drag a card. We'll keep the rest tidy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geistSans.variable, geistMono.variable)}
    >
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

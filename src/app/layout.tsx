import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
});

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
  metadataBase: new URL("https://stax.com"),
  title: {
    default: "Stax — Every job, in its place.",
    template: "%s | Stax",
  },
  description:
    "A calm, single-canvas tracker for everywhere you've applied. Paste a link, drag a card. We'll keep the rest tidy.",
  keywords: ["job tracker", "resume builder", "job applications", "career", "kanban"],
  authors: [{ name: "Stax" }],
  creator: "Stax",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stax.com",
    title: "Stax — Every job, in its place.",
    description: "A calm, single-canvas tracker for everywhere you've applied.",
    siteName: "Stax",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stax — Every job, in its place.",
    description: "A calm, single-canvas tracker for everywhere you've applied.",
    creator: "@stax",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
      className={cn("font-sans", inter.variable, playfairDisplay.variable, geistSans.variable, geistMono.variable)}
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

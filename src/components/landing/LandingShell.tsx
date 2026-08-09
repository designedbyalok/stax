import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import "./styles/index.css";

// Landing-only fonts. Scoped here (not in the root layout) so app routes
// don't pay the FCP cost for woff2s they never use.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
});

const geistSans = localFont({
  src: "../../app/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export function LandingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "landing-page",
        jetbrainsMono.variable,
        geistSans.variable,
        className,
      )}
      data-glass="on"
    >
      {children}
    </div>
  );
}

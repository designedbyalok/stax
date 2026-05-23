import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-xs font-bold text-background">S</span>
          </div>
          <span className="text-base font-semibold tracking-tight">Stax</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Track every job application in one place.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Paste a job link. Stax pulls the details, organizes it on a board,
            and reminds you to follow up before it goes cold.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="lg" render={<Link href="/signup">Get started</Link>} />
          <Button size="lg" variant="ghost" render={<Link href="/login">Log in</Link>} />
        </div>
      </div>
    </div>
  );
}

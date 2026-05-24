import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// One-line AI nudge attached to a card or row. Three tones:
// - default: neutral, sparkle icon (informational summary)
// - warning: amber, alert icon (stale, needs a nudge)
// - success: emerald, check icon (offer received, etc.)
//
// Truncates to a single line with ellipsis. The full text shows
// in the native browser tooltip on hover.
export function AINote({
  text,
  tone = "default",
  className,
}: {
  text: string;
  tone?: "default" | "warning" | "success";
  className?: string;
}) {
  const Icon = tone === "warning" ? AlertCircle : tone === "success" ? CheckCircle2 : Sparkles;
  return (
    <div
      title={text}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium leading-snug",
        tone === "default" && "bg-muted text-foreground/85",
        tone === "warning" && "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
        tone === "success" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
        className
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3 shrink-0",
          tone === "default" && "text-[var(--tint-strong,hsl(var(--muted-foreground)))]",
          tone === "warning" && "text-amber-600",
          tone === "success" && "text-emerald-600"
        )}
        strokeWidth={2}
      />
      <span className="truncate">{text}</span>
    </div>
  );
}

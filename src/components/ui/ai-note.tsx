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
  lines = 2,
  className,
}: {
  text: string;
  tone?: "default" | "warning" | "success";
  /** How many lines to clamp the text to before showing an ellipsis. */
  lines?: 1 | 2 | 3;
  className?: string;
}) {
  const Icon = tone === "warning" ? AlertCircle : tone === "success" ? CheckCircle2 : Sparkles;
  const clamp =
    lines === 1
      ? "line-clamp-1"
      : lines === 2
        ? "line-clamp-2"
        : "line-clamp-3";
  return (
    <div
      title={text}
      className={cn(
        "flex items-start gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium leading-[1.4]",
        tone === "default" && "bg-muted text-foreground/85",
        tone === "warning" && "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
        tone === "success" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
        className
      )}
    >
      <Icon
        className={cn(
          "h-3 w-3 shrink-0 mt-[1px]",
          tone === "default" && "text-[var(--tint-strong,hsl(var(--muted-foreground)))]",
          tone === "warning" && "text-amber-600",
          tone === "success" && "text-emerald-600"
        )}
        strokeWidth={2}
      />
      <span className={clamp}>{text}</span>
    </div>
  );
}

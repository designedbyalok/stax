import { cn } from "@/lib/utils";

// A tiny colored dot. The default color reads from the local
// `--tint-strong` CSS variable so a parent with `data-stage=...`
// drives the hue automatically; you can also pass an explicit
// `color` (any CSS color string) when there's no stage context.
export function Pip({
  className,
  color,
  size = 6,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block rounded-full shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: color ?? "var(--tint-strong, hsl(var(--muted-foreground)))",
      }}
    />
  );
}

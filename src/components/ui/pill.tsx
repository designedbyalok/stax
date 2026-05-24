import { cn } from "@/lib/utils";

// Compact metadata pill (location, salary, role type, etc.).
// Sits inside a card's meta row. Variants are subtle tonal
// shifts rather than loud chips.
export function Pill({
  children,
  icon,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[12px] font-medium leading-snug",
        variant === "default" && "bg-muted text-foreground/85",
        variant === "success" && "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
        variant === "warning" && "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0 opacity-70 [&_svg]:h-2.5 [&_svg]:w-2.5">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
}

import { Pip } from "@/components/ui/pip";
import { Sparkline } from "@/components/ui/sparkline";

// Single stat tile used inside the dashboard stats strip.
// Pip + label + big number + optional delta + optional sparkline.
//
// Sparkline color comes from the pip color so the whole tile reads
// as one accent. The number uses tabular-nums for clean column
// alignment across tiles.
export function StatCard({
  label,
  value,
  pipColor,
  delta,
  sparkline,
  onClick,
}: {
  label: string;
  value: number | string;
  pipColor: string;
  delta?: React.ReactNode;
  sparkline?: number[];
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left bg-card border border-border rounded-[10px] p-3.5 overflow-hidden transition-colors hover:bg-[hsl(var(--background))] hover:border-[hsl(var(--foreground)/0.12)]"
    >
      <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
        <Pip color={pipColor} />
        <span>{label}</span>
      </div>
      <div className="text-[22px] font-semibold tabular-nums tracking-[-0.015em] text-foreground leading-[1.2] mt-1">
        {value}
      </div>
      {delta && (
        <div className="text-[12px] text-muted-foreground leading-[1.4] mt-0.5">
          {delta}
        </div>
      )}
      {sparkline && sparkline.length > 1 && (
        <Sparkline
          values={sparkline}
          color={pipColor}
          className="absolute right-3 bottom-3 opacity-50 group-hover:opacity-70 transition-opacity"
        />
      )}
    </button>
  );
}

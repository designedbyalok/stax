import { Sparkles } from "lucide-react";

export function JobTldrBlock({
  headline,
  bullets,
  responsibilities = [],
  qualifications = [],
  keywords = [],
}: {
  headline: string | null;
  bullets: string[] | null;
  responsibilities?: string[];
  qualifications?: string[];
  keywords?: string[];
}) {
  const hasLegacyTldr = headline || (bullets && bullets.length > 0);
  const hasInsights = responsibilities.length > 0 || qualifications.length > 0;
  
  if (!hasLegacyTldr && !hasInsights) return null;

  return (
    <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-4">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" strokeWidth={2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          AI Powered Summary
        </span>
      </div>

      {hasLegacyTldr && (
        <div className="space-y-2">
          {headline && (
            <p className="text-[13px] font-medium text-foreground leading-snug">
              {headline}
            </p>
          )}
          {bullets && bullets.length > 0 && (
            <ul className="text-[12px] text-muted-foreground space-y-1 leading-relaxed">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="text-foreground/40 select-none">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasInsights && (
        <div className="grid grid-cols-2 gap-4 border-t pt-3">
          {responsibilities.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[12px] font-medium text-foreground">Responsibilities</h4>
              <ul className="text-[12px] text-muted-foreground space-y-1 pl-3 list-disc">
                {responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {qualifications.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[12px] font-medium text-foreground">Qualifications</h4>
              <ul className="text-[12px] text-muted-foreground space-y-1 pl-3 list-disc">
                {qualifications.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {keywords.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <h4 className="text-[12px] font-medium text-foreground">Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-[11px] rounded-sm font-medium"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

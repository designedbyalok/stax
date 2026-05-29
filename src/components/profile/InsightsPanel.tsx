"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe2, Info, Loader2, MapPin, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { api, ApiSalaryDistribution } from "@/lib/api-client";
import { citiesForCountry } from "@/lib/insights/options";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function fmtMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: value >= 1_00_000 ? "compact" : "standard",
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

// p25→p90 range bar with the p25–p75 band emphasized, the median tick, and an
// optional marker for the user's own salary.
function DistributionBar({ dist, salary }: { dist: ApiSalaryDistribution; salary?: number | null }) {
  const lo = dist.p25;
  const hi = dist.p90;
  const span = Math.max(1, hi - lo);
  const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - lo) / span) * 100))}%`;
  return (
    <div className="pt-8 pb-1">
      <div className="relative h-2.5 rounded-full bg-muted">
        <div
          className="absolute h-2.5 rounded-full bg-primary/30"
          style={{ left: pos(dist.p25), right: `calc(100% - ${pos(dist.p75)})` }}
        />
        <div className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded bg-primary" style={{ left: pos(dist.p50) }} />
        {salary != null && (
          <div
            className="absolute -top-7 flex flex-col items-center"
            style={{ left: pos(salary), transform: "translateX(-50%)" }}
          >
            <span className="whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] font-medium text-background">
              You
            </span>
            <span className="mt-0.5 h-3 w-3 rounded-full border-2 border-background bg-foreground shadow" />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] tabular-nums text-muted-foreground">
        <span>{fmtMoney(dist.p25, dist.currency)}</span>
        <span className="font-medium text-foreground">{fmtMoney(dist.p50, dist.currency)}</span>
        <span>{fmtMoney(dist.p90, dist.currency)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function InsightsPanel({ className }: { className?: string }) {
  const [cityOverride, setCityOverride] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<"city" | "country">("city");
  const [generating, setGenerating] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["insights", { city: cityOverride ?? null, scope }],
    queryFn: () => api.getInsights({ city: cityOverride, scope }),
  });

  // "Generate insight" forces a fresh AI estimate (refresh=1), then caches it
  // into the query so the view updates in place.
  const generate = async () => {
    setGenerating(true);
    try {
      const fresh = await api.getInsights({ city: cityOverride, scope, refresh: true });
      qc.setQueryData(["insights", { city: cityOverride ?? null, scope }], fresh);
    } catch {
      /* defensive — leave existing data in place */
    } finally {
      setGenerating(false);
    }
  };
  const busy = isFetching || generating;

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile().then((r) => r.profile),
  });
  const ownSalary = profile?.currentSalary ?? null;
  const ownCurrency = profile?.salaryCurrency ?? null;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-muted-foreground">Couldn’t load insights. Try again shortly.</p>;
  }

  if ("needsProfile" in data) {
    return (
      <div className={cn("rounded-xl border border-dashed p-6 text-center", className)}>
        <Sparkles className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Add your role</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Set your job role (and ideally your city) in the Profile tab, then generate your insight.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Generate insight
        </button>
      </div>
    );
  }

  const place = data.scope === "country" ? data.country : data.city ?? data.country;
  const cityList = Array.from(
    new Set([...(data.city ? [data.city] : []), ...citiesForCountry(data.country)])
  );
  const showMarker =
    ownSalary != null &&
    data.distribution != null &&
    (ownCurrency == null || ownCurrency === data.distribution.currency);

  return (
    <div className={cn("space-y-5", className)}>
      {/* Scope controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-lg border p-0.5">
          <button
            type="button"
            onClick={() => setScope("city")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              scope === "city" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="h-3.5 w-3.5" /> By metro
          </button>
          <button
            type="button"
            onClick={() => setScope("country")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              scope === "country" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe2 className="h-3.5 w-3.5" /> All India
          </button>
        </div>
        {scope === "city" && (
          <Select
            value={cityOverride ?? data.city ?? undefined}
            onValueChange={(v) => setCityOverride(v ?? undefined)}
          >
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Choose metro" />
            </SelectTrigger>
            <SelectContent>
              {cityList.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted disabled:opacity-60"
          title="Regenerate a fresh AI estimate"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Generate insight
        </button>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/[0.06] to-transparent p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <TrendingUp className="h-4 w-4" /> {data.role} · {data.bracket} yrs
        </div>
        <p className="mt-2 text-lg font-semibold tracking-tight">
          You’re 1 of {data.comparableCount.toLocaleString("en-IN")} {data.role}
          {data.comparableCount === 1 ? "" : "s"} in <span className="text-primary">{place}</span>
        </p>

        {data.distribution ? (
          <>
            <DistributionBar dist={data.distribution} salary={showMarker ? ownSalary : undefined} />
            {data.position ? (
              <div className="mt-4 rounded-xl border bg-card px-4 py-3 text-sm">
                Your salary sits in the <span className="font-semibold text-primary">{data.position.label}</span> for{" "}
                {data.role}s with {data.bracket} years’ experience in {place}.
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed px-4 py-3 text-xs text-muted-foreground">
                Add your current salary in the Profile tab to see exactly where you stand. It stays private and is only
                used anonymously.
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No salary data yet for this role &amp; metro.</p>
        )}
      </div>

      {/* Stats */}
      {data.distribution && (
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Median" value={fmtMoney(data.distribution.median, data.distribution.currency)} sub="50th percentile" />
          <Stat
            label="Typical"
            value={`${fmtMoney(data.distribution.p25, data.distribution.currency)}–${fmtMoney(data.distribution.p75, data.distribution.currency)}`}
            sub="25th–75th"
          />
          <Stat label="Top 10%" value={fmtMoney(data.distribution.p90, data.distribution.currency)} sub="90th percentile" />
        </div>
      )}

      {/* Source + freshness */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <span className="font-medium text-foreground">Where this comes from:</span>{" "}
          {data.source === "community"
            ? "anonymized, opted-in salaries shared by Stax members, blended with market benchmarks."
            : data.source === "ai"
              ? "an AI compensation estimate based on current market rates."
              : "curated market benchmarks."}{" "}
          Figures are estimates of annual gross base pay.
          {data.distribution ? ` Comparable pool ~${data.distribution.sampleSize.toLocaleString()}.` : ""}
          <div className="mt-0.5">
            Last updated{" "}
            {new Date(data.refreshedAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {data.source === "ai" ? " · regenerate anytime with Generate insight." : " · refreshed weekly."}
          </div>
        </div>
      </div>
    </div>
  );
}

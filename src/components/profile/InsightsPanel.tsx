"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe2, MapPin, TrendingUp, Sparkles } from "lucide-react";
import { api, ApiSalaryDistribution, ApiSalaryPosition } from "@/lib/api-client";
import { KNOWN_CITIES } from "@/lib/insights/options";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function fmtMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

// Horizontal p25→p90 range bar with median + (optional) the user's salary marker.
function DistributionBar({
  dist,
  salary,
}: {
  dist: ApiSalaryDistribution;
  salary?: number | null;
}) {
  const lo = dist.p25;
  const hi = dist.p90;
  const span = Math.max(1, hi - lo);
  const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - lo) / span) * 100))}%`;
  return (
    <div className="pt-6 pb-2">
      <div className="relative h-2 rounded-full bg-muted">
        {/* p25–p75 emphasis */}
        <div
          className="absolute h-2 rounded-full bg-primary/25"
          style={{ left: pos(dist.p25), right: `calc(100% - ${pos(dist.p75)})` }}
        />
        {/* median */}
        <div
          className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded bg-primary"
          style={{ left: pos(dist.p50) }}
        />
        {/* user's salary */}
        {salary != null && (
          <div
            className="absolute -top-1.5 grid place-items-center"
            style={{ left: pos(salary), transform: "translateX(-50%)" }}
            title="You"
          >
            <div className="h-5 w-5 rounded-full border-2 border-background bg-foreground shadow" />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{fmtMoney(dist.p25, dist.currency)}</span>
        <span className="font-medium text-foreground">{fmtMoney(dist.p50, dist.currency)}</span>
        <span>{fmtMoney(dist.p90, dist.currency)}</span>
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tracking-tight tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export function InsightsPanel({ className }: { className?: string }) {
  // City override + scope toggle. Undefined city => use the profile's city.
  const [cityOverride, setCityOverride] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<"city" | "country">("city");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["insights", { city: cityOverride ?? null, scope }],
    queryFn: () => api.getInsights({ city: cityOverride, scope }),
  });

  // The user's own salary (for the distribution marker) lives on the profile,
  // not the insights payload. Reuse the cached ["profile"] query.
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile().then((r) => r.profile),
  });
  const ownSalary = profileData?.currentSalary ?? null;
  const ownCurrency = profileData?.salaryCurrency ?? null;

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-2 w-full" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">Couldn’t load insights. Try again shortly.</p>;
  }

  if (!data || "needsProfile" in data) {
    return (
      <div className={cn("rounded-xl border border-dashed p-5 text-center", className)}>
        <Sparkles className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Add your role & location</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tell us your job role and city to unlock personalized salary & demand insights.
        </p>
      </div>
    );
  }

  const place = data.scope === "country" ? data.country : data.city ?? data.country;
  const cityList = Array.from(new Set([...(data.city ? [data.city] : []), ...KNOWN_CITIES]));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Scope controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-md border p-0.5">
          <button
            type="button"
            onClick={() => setScope("city")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
              scope === "city" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="h-3.5 w-3.5" /> City
          </button>
          <button
            type="button"
            onClick={() => setScope("country")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
              scope === "country" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe2 className="h-3.5 w-3.5" /> Whole country
          </button>
        </div>
        {scope === "city" && (
          <select
            value={cityOverride ?? data.city ?? ""}
            onChange={(e) => setCityOverride(e.target.value || undefined)}
            className="h-8 rounded-md border bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
            aria-label="Choose city"
          >
            {cityList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Headline */}
      <div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>
            You’re <span className="font-semibold">1 of {data.comparableCount.toLocaleString()}</span>{" "}
            {data.role}
            {data.comparableCount === 1 ? "" : "s"} in <span className="font-medium">{place}</span>
          </span>
        </div>
        {!data.comparableIsReal && (
          <p className="mt-1 text-[11px] text-muted-foreground">Based on market estimates · refreshed weekly</p>
        )}
      </div>

      {data.distribution ? (
        <>
          <DistributionBar
            dist={data.distribution}
            salary={ownSalary != null && (ownCurrency == null || ownCurrency === data.distribution.currency) ? ownSalary : undefined}
          />
          <div className="grid grid-cols-3 gap-2">
            <StatBlock
              label="Median"
              value={fmtMoney(data.distribution.median, data.distribution.currency)}
              sub={`${data.bracket} yrs`}
            />
            <StatBlock
              label="Typical range"
              value={`${fmtMoney(data.distribution.p25, data.distribution.currency)}–${fmtMoney(data.distribution.p75, data.distribution.currency)}`}
            />
            <StatBlock
              label="Top 10%"
              value={fmtMoney(data.distribution.p90, data.distribution.currency)}
            />
          </div>

          {data.position ? (
            <div className="rounded-lg border bg-primary/5 p-3 text-sm">
              You’re in the <span className="font-semibold">{data.position.label}</span> for {data.role}s with{" "}
              {data.bracket} years’ experience in {place}.
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
              Add your current salary in your profile to see exactly where you stand. It stays private and is only
              ever used anonymously in aggregates.
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            Estimates · {data.source === "community" ? "community data" : "market benchmark"} · updated{" "}
            {new Date(data.refreshedAt).toLocaleDateString()}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No salary data yet for this role & location.</p>
      )}
    </div>
  );
}

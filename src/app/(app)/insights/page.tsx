"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const InsightsPanel = dynamic(
  () => import("@/components/profile/InsightsPanel").then((m) => m.InsightsPanel),
  { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
);

export default function InsightsPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Career insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See how you compare on pay and demand for your role and location. Estimates blend market benchmarks with
          anonymized community data, refreshed weekly.
        </p>
        <div className="mt-8">
          <InsightsPanel />
        </div>
      </div>
    </div>
  );
}

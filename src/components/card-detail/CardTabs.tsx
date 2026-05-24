"use client";

import { useState } from "react";
import { OverviewTab } from "./OverviewTab";
import { PrepTab } from "./PrepTab";
import { DocumentsTab } from "./DocumentsTab";
import { ApiApplication, ApiApplicationDetail } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function CardTabs({
  card,
  detail,
  draft,
  updateField,
}: {
  // `card` is the summary record from the board cache, present immediately.
  // `detail` is the enriched record (contacts/activities/email events/etc.)
  // and may be null while the per-card fetch is still in flight.
  card: ApiApplication;
  detail: ApiApplicationDetail | null | undefined;
  draft: Partial<ApiApplicationDetail>;
  updateField: (key: string, value: unknown) => void;
}) {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PREP" | "DOCUMENTS">("OVERVIEW");

  // Check if the current column is an interview stage
  const { data: columns } = useQuery({
    queryKey: ["columns"],
    queryFn: () => api.listColumns().then(r => r.columns),
  });

  const column = columns?.find(c => c.id === card.columnId);
  const isInterviewStage = column?.isInterviewStage || false;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-5 border-b flex items-center gap-6 shrink-0 pt-2">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === "OVERVIEW" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview
        </button>
        {isInterviewStage && (
          <button
            onClick={() => setActiveTab("PREP")}
            className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === "PREP" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Prep
          </button>
        )}
        <button
          onClick={() => setActiveTab("DOCUMENTS")}
          className={`pb-2 text-[13px] font-medium border-b-2 transition-colors ${
            activeTab === "DOCUMENTS" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Documents
        </button>
      </div>

      <div key={activeTab} className="tab-content flex-1 flex flex-col overflow-hidden">
        {activeTab === "OVERVIEW" && (
          <OverviewTab card={card} detail={detail} draft={draft} updateField={updateField} />
        )}
        {activeTab === "PREP" && isInterviewStage && (
          <PrepTab card={card} detail={detail} />
        )}
        {activeTab === "DOCUMENTS" && (
          <DocumentsTab
            card={card}
            detail={detail}
            onUpdate={(fields) => {
              Object.entries(fields).forEach(([k, v]) => updateField(k, v));
            }}
          />
        )}
      </div>
    </div>
  );
}

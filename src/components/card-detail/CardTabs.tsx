"use client";

import { useState } from "react";
import { OverviewTab } from "./OverviewTab";
import { PrepTab } from "./PrepTab";
import { DocumentsTab } from "./DocumentsTab";
import { ApiApplicationDetail } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function CardTabs({
  card,
  detail,
  draft,
  updateField,
}: {
  card: ApiApplicationDetail;
  detail: ApiApplicationDetail;
  draft: Partial<ApiApplicationDetail>;
  updateField: (key: string, value: any) => void;
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

      {activeTab === "OVERVIEW" && (
        <OverviewTab card={card} detail={detail} draft={draft} updateField={updateField} />
      )}
      {activeTab === "PREP" && isInterviewStage && (
        <PrepTab card={card} detail={detail} />
      )}
      {activeTab === "DOCUMENTS" && (
        <DocumentsTab card={card} onUpdate={(fields) => {
          Object.entries(fields).forEach(([k, v]) => updateField(k, v));
        }} />
      )}
    </div>
  );
}

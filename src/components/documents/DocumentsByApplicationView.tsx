"use client";

import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { useState } from "react";
import { ApiDocument } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function DocumentsByApplicationView({
  type,
  documents,
}: {
  type: "RESUME" | "COVER_LETTER";
  documents: ApiDocument[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (documents.length === 0) {
    return null; // Handled by parent empty state
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-sm font-medium px-1">Applications by {type === "RESUME" ? "Resume" : "Cover Letter"}</h2>
      <div className="border rounded-md divide-y overflow-hidden bg-card">
        {documents.map((doc) => {
          const count = type === "RESUME" ? doc._count?.resumeApplications ?? 0 : doc._count?.coverLetterApplications ?? 0;
          const isExpanded = expanded[doc.id];

          return (
            <div key={doc.id} className="flex flex-col">
              <button
                onClick={() => toggle(doc.id)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{doc.name}</span>
                    {doc.isPrimary && (
                      <span className="text-[10px] uppercase font-semibold bg-secondary text-secondary-foreground px-1.5 py-0 rounded-sm">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doc.filename}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {count} {count === 1 ? "application" : "applications"}
                </div>
              </button>
              
              {isExpanded && (
                <div className="bg-muted/20 px-11 py-3 border-t text-sm">
                  {count > 0 ? (
                    <div className="text-muted-foreground text-sm">
                      {/* Note: V1 only has counts. V2 will add a dedicated API endpoint to fetch the actual application list per document. */}
                      This document is attached to {count} application{count === 1 ? "" : "s"}.
                      <br/>
                      <span className="text-xs opacity-70">(Detailed list view coming soon)</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">Not used yet.</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

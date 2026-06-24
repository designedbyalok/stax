"use client";

import { ChevronDown, ChevronRight, FileText, Eye } from "@/components/icons";
import { useState } from "react";
import { ApiDocument } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import { memo } from "react";

const DocumentRow = memo(function DocumentRow({
  doc,
  type,
  isExpanded,
  onToggle,
  onPreview,
}: {
  doc: ApiDocument;
  type: "RESUME" | "COVER_LETTER";
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onPreview: (doc: ApiDocument) => void;
}) {
  const count = type === "RESUME" ? doc._count?.resumeApplications ?? 0 : doc._count?.coverLetterApplications ?? 0;

  return (
    <div className="flex flex-col">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggle(doc.id)}
        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left cursor-pointer"
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
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs text-muted-foreground">
            {count} {count === 1 ? "application" : "applications"}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(doc);
            }}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Preview Document"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-muted/20 border-t">
          {count > 0 ? (
            <div className="flex flex-col divide-y divide-border/50">
              {(type === "RESUME" ? doc.resumeApplications : doc.coverLetterApplications)?.map(app => (
                <div key={app.id} className="px-11 py-2.5 flex items-center justify-between text-sm hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-foreground truncate">{app.roleTitle}</span>
                    <span className="text-xs text-muted-foreground truncate">{app.companyName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                    {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-11 py-3">
              <span className="text-muted-foreground text-sm italic">Not used yet.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export function DocumentsByApplicationView({
  type,
  documents,
  onPreview,
}: {
  type: "RESUME" | "COVER_LETTER";
  documents: ApiDocument[];
  onPreview: (doc: ApiDocument) => void;
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
        {documents.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            type={type}
            isExpanded={!!expanded[doc.id]}
            onToggle={toggle}
            onPreview={onPreview}
          />
        ))}
      </div>
    </div>
  );
}

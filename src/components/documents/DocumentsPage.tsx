"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { FileText, Upload } from "lucide-react";
import { api, ApiDocument } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UploadModal } from "./UploadModal";
import { DocumentsByApplicationView } from "./DocumentsByApplicationView";
import { Skeleton } from "@/components/ui/skeleton";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const [tab, setTab] = useState<"RESUME" | "COVER_LETTER">("RESUME");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewByApp, setViewByApp] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", tab],
    queryFn: () => api.listDocuments(tab).then((res) => res.documents),
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="px-6 h-14 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-sm font-semibold tracking-tight">Documents</h1>
          <div className="flex items-center bg-muted/50 p-1 rounded-md">
            <button
              onClick={() => setTab("RESUME")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                tab === "RESUME" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resumes
            </button>
            <button
              onClick={() => setTab("COVER_LETTER")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                tab === "COVER_LETTER" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cover Letters
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewByApp(!viewByApp)}
            className="text-xs"
          >
            {viewByApp ? "View grid" : "View by application"}
          </Button>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 flex flex-col gap-3 border rounded-xl bg-card">
                <div className="flex justify-between items-start gap-2">
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-sm shrink-0" />
                </div>
                <div className="flex items-center justify-between mt-1 pt-3 border-t">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : viewByApp ? (
          <DocumentsByApplicationView type={tab} documents={data ?? []} />
        ) : data?.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium">No documents yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Upload your {tab === "RESUME" ? "resumes" : "cover letters"} here to attach them to job applications.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-6"
              onClick={() => setUploadOpen(true)}
            >
              Upload {tab === "RESUME" ? "resume" : "cover letter"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((doc: ApiDocument) => (
              <Card key={doc.id} className="p-4 flex flex-col gap-3 group relative overflow-hidden transition-colors hover:bg-muted/30">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground truncate" title={doc.filename}>
                      {doc.filename} · {formatSize(doc.sizeBytes)}
                    </p>
                  </div>
                  {doc.isPrimary && (
                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold shrink-0 rounded-sm px-1.5 py-0">
                      Primary
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 pt-3 border-t">
                  <span className="text-[11px] text-muted-foreground">
                    Used on {tab === "RESUME" ? doc._count?.resumeApplications : doc._count?.coverLetterApplications} apps
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultType={tab}
      />
    </div>
  );
}

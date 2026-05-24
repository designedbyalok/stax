"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Upload } from "lucide-react";
import { api, ApiDocument } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { DocumentsByApplicationView } from "./DocumentsByApplicationView";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PdfPreview } from "./PdfPreview";
import { DocxPreview } from "./DocxPreview";
import { DocumentCard } from "./DocumentCard";

export function DocumentsPage() {
  const [tab, setTab] = useState<"RESUME" | "COVER_LETTER">("RESUME");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewByApp, setViewByApp] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ApiDocument | null>(null);

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
          <DocumentsByApplicationView type={tab} documents={data ?? []} onPreview={setPreviewDoc} />
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
          <div
            key={tab}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-list"
          >
            {data?.map((doc: ApiDocument) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                type={tab}
                onPreview={setPreviewDoc}
              />
            ))}
          </div>
        )}
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultType={tab}
      />

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b shrink-0 bg-muted/30">
            <DialogTitle className="text-base font-semibold">{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative bg-muted/10">
            {previewDoc && (
              previewDoc.mimeType === "application/pdf" ? (
                <PdfPreview documentId={previewDoc.id} width={750} />
              ) : (
                <DocxPreview documentId={previewDoc.id} />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

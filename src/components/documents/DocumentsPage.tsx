"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Upload } from "@/components/icons";
import { api, ApiDocument } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { UploadModal } from "./UploadModal";
import { DocumentsByApplicationView } from "./DocumentsByApplicationView";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PdfPreview } from "./PdfPreview";
import { DocxPreview } from "./DocxPreview";
import { UnifiedDocumentsGrid } from "./UnifiedDocumentsGrid";

export function DocumentsPage() {
  const [tab, setTab] = useState<"ALL" | "RESUME" | "COVER_LETTER">("ALL");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewByApp, setViewByApp] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ApiDocument | null>(null);

  // Fetching lives in <UnifiedDocumentsGrid> (which handles the "ALL"
  // tab itself); no list query is needed at this level.

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="px-6 h-14 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-sm font-semibold tracking-tight">Documents</h1>
          <div className="flex items-center bg-muted/50 p-1 rounded-md">
            <button
              onClick={() => setTab("ALL")}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                tab === "ALL" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
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
        <UnifiedDocumentsGrid tab={tab} onPreview={setPreviewDoc} />
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultType={tab === "ALL" ? "RESUME" : tab}
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

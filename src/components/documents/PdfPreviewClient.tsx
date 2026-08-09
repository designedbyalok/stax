"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ExternalLink, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

// Self-hosted worker — same origin, no CORS, no flaky CDN. The file is
// shipped from public/pdf.worker.min.mjs (copied out of node_modules).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfPreviewClient({
  documentId,
  width = 340,
  isThumbnail = false,
}: {
  documentId: string;
  width?: number;
  isThumbnail?: boolean;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch the signed URL to display the PDF securely
  const urlQuery = useQuery({
    queryKey: ["documentUrl", documentId],
    queryFn: () => api.getDocumentUrl(documentId).then((r) => r.url),
    staleTime: 4 * 60 * 1000, // signed URL valid 5 min; refresh just under
  });

  const signedUrl = urlQuery.data;

  return (
    <div className={cn("flex flex-col h-full", !isThumbnail && "bg-muted/20 border rounded-md overflow-hidden")}>
      <div className={cn("flex-1 flex justify-center", isThumbnail ? "overflow-hidden p-0 m-0" : "overflow-auto p-4 bg-black/5")}>
        {urlQuery.isLoading || !signedUrl ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <span className="text-xs">Loading PDF securely...</span>
          </div>
        ) : (
          <Document
            file={signedUrl}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setLoadError(null);
            }}
            onLoadError={(err) => {
              console.error("PDF load error:", err);
              setLoadError(err.message || "Failed to load PDF");
            }}
            loading={
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <span className="text-xs">Rendering…</span>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-40 text-destructive text-xs px-4 text-center">
                {loadError || "Couldn't render this PDF."}
              </div>
            }
          >
            {!loadError && numPages && (isThumbnail ? (
              <Page
                pageNumber={1}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="max-w-full"
              />
            ) : (
              Array.from({ length: numPages }, (_, pageIndex) => {
                const pageNumber = pageIndex + 1;
                return (
                <Page
                  key={`page-${pageNumber}`}
                  pageNumber={pageNumber}
                  width={width}
                  renderTextLayer={false}
                  renderAnnotationLayer={true}
                  className="shadow-sm border rounded-sm overflow-hidden mb-6 max-w-full"
                />
                );
              })
            ))}
          </Document>
        )}
      </div>
      {!isThumbnail && (
        <div className="p-2 border-t bg-background flex items-center justify-between shrink-0">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">
            {numPages ? `Page 1 of ${numPages}` : "Preview"}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-[11px] gap-1 px-2"
            disabled={!signedUrl}
            nativeButton={!signedUrl}
            render={
              signedUrl ? (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open full PDF"
                />
              ) : undefined
            }
          >
            Open full
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

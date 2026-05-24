"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, Page, pdfjs } from "react-pdf";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

// Self-hosted worker — same origin, no CORS, no flaky CDN. The file is
// shipped from public/pdf.worker.min.mjs (copied out of node_modules).
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfPreviewClient({
  documentId,
}: {
  documentId: string;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [loadError, setLoadError] = useState<string | null>(null);

  // /api/documents/<id>/url returns { url: signedUrl }. We need the URL
  // *here*, not the API endpoint — react-pdf streams bytes from the
  // `file` prop directly.
  const urlQuery = useQuery({
    queryKey: ["documentUrl", documentId],
    queryFn: () => api.getDocumentUrl(documentId).then((r) => r.url),
    staleTime: 4 * 60 * 1000, // signed URL valid 5 min; refresh just under
  });

  const signedUrl = urlQuery.data;

  return (
    <div className="flex flex-col h-full bg-muted/20 border rounded-md overflow-hidden">
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-black/5">
        {urlQuery.isLoading || !signedUrl ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <span className="text-xs">Loading PDF…</span>
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
            {!loadError && (
              <Page
                pageNumber={1}
                width={340}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-sm border rounded-sm overflow-hidden"
              />
            )}
          </Document>
        )}
      </div>
      <div className="p-2 border-t bg-background flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground uppercase font-medium">
          {numPages ? `Page 1 of ${numPages}` : "Preview"}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[11px] gap-1 px-2"
          disabled={!signedUrl}
          onClick={() => signedUrl && window.open(signedUrl, "_blank")}
        >
          Open full
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Configure worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfPreview({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState(false);

  return (
    <div className="flex flex-col h-full bg-muted/20 border rounded-md overflow-hidden">
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-black/5">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(err) => {
            console.error("PDF load error:", err);
            setError(true);
          }}
          loading={
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mb-2" />
              <span className="text-xs">Loading PDF...</span>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-40 text-destructive text-xs">
              Failed to load PDF.
            </div>
          }
        >
          {!error && (
            <Page
              pageNumber={1}
              width={340} // Fit nicely in the side sheet
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-sm border rounded-sm overflow-hidden"
            />
          )}
        </Document>
      </div>
      <div className="p-2 border-t bg-background flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground uppercase font-medium">
          {numPages ? `Page 1 of ${numPages}` : "Preview"}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[11px] gap-1 px-2"
          onClick={() => window.open(url, "_blank")}
        >
          Open full
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

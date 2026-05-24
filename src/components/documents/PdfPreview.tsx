import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the client implementation with SSR disabled.
// This prevents Next.js SSR Webpack from crashing when importing pdfjs-dist.
const PdfPreviewClient = dynamic(
  () => import("./PdfPreviewClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-40 bg-muted/20 border rounded-md text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-xs">Loading PDF viewer...</span>
      </div>
    ),
  }
);

export function PdfPreview({ documentId }: { documentId: string }) {
  return <PdfPreviewClient documentId={documentId} />;
}

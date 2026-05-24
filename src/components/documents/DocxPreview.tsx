"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function DocxPreview({ documentId }: { documentId: string }) {
  const { data: urlData } = useQuery({
    queryKey: ["documentUrl", documentId],
    queryFn: () => api.getDocumentUrl(documentId),
  });

  const { data: previewData, isLoading, isError } = useQuery({
    queryKey: ["docxPreview", documentId],
    queryFn: () => api.getDocxPreview(documentId),
  });

  return (
    <div className="flex flex-col h-full bg-muted/20 border rounded-md overflow-hidden">
      <div className="flex-1 overflow-auto p-4 bg-background">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mb-2" />
            <span className="text-xs">Converting DOCX...</span>
          </div>
        ) : isError || !previewData?.html ? (
          <div className="flex flex-col items-center justify-center h-40 text-destructive text-xs">
            Failed to generate preview.
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none text-sm docx-preview-content"
            dangerouslySetInnerHTML={{ __html: previewData.html }}
          />
        )}
      </div>
      <div className="p-2 border-t bg-muted/30 flex items-center justify-between shrink-0">
        <span className="text-[10px] text-muted-foreground italic">
          Preview is approximate
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[11px] gap-1 px-2"
          disabled={!urlData?.url}
          nativeButton={!urlData?.url}
          render={urlData?.url ? <a href={urlData.url} target="_blank" rel="noopener noreferrer" /> : undefined}
        >
          Download
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

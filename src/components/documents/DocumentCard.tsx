"use client";

import { useRef, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Download, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiDocument } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { PdfPreview } from "./PdfPreview";
import { DocxPreview } from "./DocxPreview";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(doc: ApiDocument): string {
  if (doc.mimeType === "application/pdf") return "PDF";
  if (doc.mimeType.includes("word") || doc.filename.toLowerCase().endsWith(".docx")) return "DOCX";
  const ext = doc.filename.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "FILE";
}

const EXT_TINT: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: "bg-rose-50 dark:bg-rose-950/40",     text: "text-rose-700 dark:text-rose-300" },
  DOCX: { bg: "bg-sky-50 dark:bg-sky-950/40",       text: "text-sky-700 dark:text-sky-300" },
  TXT:  { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300" },
  FILE: { bg: "bg-muted",                            text: "text-foreground/70" },
};

export function DocumentCard({
  doc,
  type,
  ownerName,
  onPreview,
}: {
  doc: ApiDocument;
  type: "RESUME" | "COVER_LETTER";
  /** Falls back to "You" if not provided. */
  ownerName?: string | null;
  onPreview: (doc: ApiDocument) => void;
}) {
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(300);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteDocument(doc.id),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", doc.id] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't delete"),
  });

  async function handleDownload() {
    try {
      const r = await api.getDocumentUrl(doc.id);
      if (r.url) window.open(r.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't get download URL");
    }
  }

  const ext = extensionOf(doc);
  const tint = EXT_TINT[ext] || EXT_TINT.FILE;
  const tagLabel = type === "RESUME" ? "Uploaded Resume" : "Cover Letter";

  return (
    <div 
      className="group flex flex-col gap-2 cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02]"
      onClick={() => onPreview(doc)}
    >
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm group-hover:shadow-md transition-shadow">
        
        {/* Type Badge - Top Right */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide shadow-sm backdrop-blur-md bg-white/80 dark:bg-black/60 text-foreground border border-black/5 dark:border-white/10">
            {tagLabel}
          </span>
        </div>

        {/* Dropdown Menu - Top Left (Stop propagation so it doesn't open preview) */}
        <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => onPreview(doc)}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteMutation.mutate()}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Aspect Ratio Container for 8.5x11 */}
        <div ref={containerRef} className={cn("relative w-full aspect-[8.5/11] flex flex-col items-center justify-center overflow-hidden", tint.bg)}>
          {/* We will render a PDF Preview if it's a PDF, otherwise an icon */}
          {ext === "PDF" ? (
             <div className="w-full h-full pointer-events-none select-none flex items-start justify-center overflow-hidden">
                <PdfPreview documentId={doc.id} width={containerWidth} isThumbnail={true} />
             </div>
          ) : ext === "DOCX" ? (
             <div className="w-full h-full pointer-events-none select-none opacity-90 scale-[1.01] flex items-center justify-center p-4">
                <DocxPreview documentId={doc.id} />
             </div>
          ) : (
            <div className={cn("flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-background/60 shadow-sm backdrop-blur-md border border-white/20", tint.text)}>
              <div className="text-3xl font-bold tracking-tighter">
                {ext}
              </div>
              <div className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
                {formatSize(doc.size)}
              </div>
            </div>
          )}
        </div>

        {/* Glassmorphic Footer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-[2px]">
          <h3 className="font-semibold text-sm truncate text-foreground drop-shadow-sm">
            {doc.filename}
          </h3>
          <p className="text-xs text-foreground/80 mt-0.5 flex items-center justify-between font-medium drop-shadow-sm">
            <span>{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
            <span>{ownerName || "You"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

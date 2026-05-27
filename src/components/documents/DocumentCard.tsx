"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Download, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
  if (!bytes || Number.isNaN(bytes)) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(doc: ApiDocument): string {
  if (doc.mimeType === "application/pdf") return "PDF";
  if (doc.mimeType.includes("word") || doc.filename.toLowerCase().endsWith(".docx"))
    return "DOCX";
  const ext = doc.filename.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "FILE";
}

const EXT_TINT: Record<string, { bg: string; text: string }> = {
  PDF: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-600 dark:text-rose-300" },
  DOCX: { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-600 dark:text-sky-300" },
  TXT: { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-300" },
  FILE: { bg: "bg-muted", text: "text-foreground/60" },
};

// Document grid card with a real rendered thumbnail. The live
// preview (PdfPreview / DocxPreview) is only mounted once the card
// scrolls into view — so opening the Documents page doesn't spin up
// a pdfjs worker per card; only visible cards render. Full-size
// previews still open one-at-a-time in the modal via onPreview.
export function DocumentCard({
  doc,
  type,
  ownerName,
  onPreview,
}: {
  doc: ApiDocument;
  type: "RESUME" | "COVER_LETTER";
  ownerName?: string | null;
  onPreview: (doc: ApiDocument) => void;
}) {
  const queryClient = useQueryClient();
  const cardRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [thumbWidth, setThumbWidth] = useState(300);

  const ext = extensionOf(doc);
  const tint = EXT_TINT[ext] || EXT_TINT.FILE;
  const tagLabel = type === "RESUME" ? "Resume" : "Cover Letter";
  const canRenderThumb = ext === "PDF" || ext === "DOCX";

  // Lazy-mount the thumbnail when the card first enters the viewport.
  useEffect(() => {
    if (!canRenderThumb || inView) return;
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // start a little before it's visible
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canRenderThumb, inView]);

  // Track the thumbnail container width so the PDF page renders crisply.
  useEffect(() => {
    const el = thumbRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setThumbWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
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
      toast.error(
        err instanceof Error ? err.message : "Couldn't get download URL"
      );
    }
  }

  return (
    <div
      ref={cardRef}
      className="group flex flex-col cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-0.5"
      onClick={() => onPreview(doc)}
    >
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm group-hover:shadow-md transition-shadow">
        {/* Type badge — top right */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide shadow-sm backdrop-blur-md bg-white/80 dark:bg-black/60 text-foreground border border-black/5 dark:border-white/10">
            {tagLabel}
          </span>
        </div>

        {/* Doc-shaped body: real thumbnail once in view, else a badge */}
        <div
          ref={thumbRef}
          className={cn(
            "relative w-full aspect-[8.5/11] overflow-hidden flex items-center justify-center",
            tint.bg
          )}
        >
          {canRenderThumb && inView ? (
            <div className="absolute inset-0 pointer-events-none select-none">
              {ext === "PDF" ? (
                <PdfPreview documentId={doc.id} width={thumbWidth} isThumbnail />
              ) : (
                <div className="w-full h-full overflow-hidden">
                  <DocxPreview documentId={doc.id} />
                </div>
              )}
            </div>
          ) : (
            <FileBadge ext={ext} sizeLabel={formatSize(doc.sizeBytes)} tintText={tint.text} />
          )}
        </div>

        {/* Glass footer overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 z-10 bg-gradient-to-t from-background/90 via-background/60 to-transparent backdrop-blur-[2px]">
          <h3
            className="font-semibold text-sm truncate text-foreground drop-shadow-sm pr-8"
            title={doc.name}
          >
            {doc.name}
          </h3>
          <p className="text-xs text-foreground/80 mt-0.5 font-medium drop-shadow-sm truncate">
            {ownerName ?? "You"} ·{" "}
            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions menu — bottom right */}
        <div
          className="absolute bottom-2 right-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/60 hover:bg-background/90 backdrop-blur-sm text-foreground transition-colors outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onPreview(doc)}>
                <Eye className="mr-2 h-4 w-4" /> Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm(`Delete "${doc.name}"? This can't be undone.`)) {
                    deleteMutation.mutate();
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function FileBadge({
  ext,
  sizeLabel,
  tintText,
}: {
  ext: string;
  sizeLabel: string;
  tintText: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-5 rounded-2xl bg-background/60 shadow-sm backdrop-blur-md border border-white/20",
        tintText
      )}
    >
      <div className="text-3xl font-bold tracking-tighter">{ext}</div>
      <div className="text-[10px] uppercase tracking-widest font-semibold opacity-60">
        {sizeLabel}
      </div>
    </div>
  );
}

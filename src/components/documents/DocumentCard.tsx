"use client";

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

// Card layout inspired by the documents-grid reference: prominent
// file-type badge in the center, title + metadata below, type tag
// + ⋯ menu at the bottom, owner/time footer outside the card.

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

// File-type → soft tint (bg + text). Designed against the warm
// canvas palette; matches the reference's softly-tinted badges.
const EXT_TINT: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: "bg-rose-50 dark:bg-rose-950/40",     text: "text-rose-700 dark:text-rose-300" },
  DOCX: { bg: "bg-sky-50 dark:bg-sky-950/40",       text: "text-sky-700 dark:text-sky-300" },
  TXT:  { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300" },
  FILE: { bg: "bg-muted",                            text: "text-foreground/70" },
};

const TYPE_PILL: Record<string, { label: string; cls: string }> = {
  RESUME:       { label: "Resume",       cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  COVER_LETTER: { label: "Cover Letter", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
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
  const ext = extensionOf(doc);
  const tint = EXT_TINT[ext] ?? EXT_TINT.FILE;
  const pill = TYPE_PILL[type];

  const usage =
    (type === "RESUME"
      ? doc._count?.resumeApplications
      : doc._count?.coverLetterApplications) ?? 0;

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

  return (
    <div className="group flex flex-col gap-2">
      <div
        onClick={() => onPreview(doc)}
        className={cn(
          "relative cursor-pointer rounded-xl border bg-card p-4 flex flex-col gap-3",
          "transition-all duration-200 ease-out",
          "hover:border-foreground/15 hover:shadow-[var(--shadow-pop)]"
        )}
      >
        {/* Top-right corner: primary badge (optional) */}
        {doc.isPrimary && (
          <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-md border bg-background text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Primary
          </span>
        )}

        {/* File-type icon block */}
        <div className="flex items-center justify-center py-4">
          <div
            className={cn(
              "rounded-xl border border-foreground/[0.06] w-[120px] h-[88px]",
              "grid place-items-center",
              tint.bg
            )}
          >
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full bg-background/80 backdrop-blur-sm text-[11px] font-semibold tracking-wide ring-1 ring-foreground/5",
                tint.text
              )}
            >
              {ext}
            </span>
          </div>
        </div>

        {/* Title + metadata */}
        <div className="space-y-0.5">
          <h3
            className="text-[14px] font-semibold text-foreground truncate"
            title={doc.name}
          >
            {doc.name}
          </h3>
          <p
            className="text-[12px] text-muted-foreground truncate"
            title={doc.filename}
          >
            {ext} · {formatSize(doc.sizeBytes)}
          </p>
        </div>

        {/* Bottom row: type tag + menu */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
              pill.cls
            )}
          >
            {pill.label}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 grid place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="More actions"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              }
            />
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(doc);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (
                    confirm(
                      `Delete "${doc.name}"? This can't be undone.`
                    )
                  ) {
                    deleteMutation.mutate();
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Footer outside the card */}
      <div className="flex items-center justify-between px-1 text-[12px] text-muted-foreground">
        <span className="truncate">{ownerName ?? "You"}</span>
        <span className="shrink-0">
          {usage > 0 && `Used on ${usage} · `}
          {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

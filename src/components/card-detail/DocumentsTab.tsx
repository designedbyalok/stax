"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Eye, Trash2, Plus, Calendar, Star, Upload, Loader2 } from "lucide-react";
import { api, ApiApplication, ApiApplicationDetail } from "@/lib/api-client";
import { toast } from "sonner";
import { DocumentPicker } from "@/components/documents/DocumentPicker";
import { PdfPreview } from "@/components/documents/PdfPreview";
import { DocxPreview } from "@/components/documents/DocxPreview";

export function DocumentsTab({
  card,
  detail,
  onUpdate,
}: {
  card: ApiApplication;
  detail: ApiApplicationDetail | null | undefined;
  onUpdate: (fields: { resumeId?: string | null; coverLetterId?: string | null }) => void;
}) {
  // `resume` / `coverLetter` only exist on the enriched detail
  // record. Use the lazy-loaded detail for the joined relations.
  const resume = detail?.resume ?? null;
  const coverLetter = detail?.coverLetter ?? null;
  const queryClient = useQueryClient();
  const [viewingResume, setViewingResume] = useState(false);
  const [viewingCoverLetter, setViewingCoverLetter] = useState(false);
  const [dragType, setDragType] = useState<"RESUME" | "COVER_LETTER" | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: "RESUME" | "COVER_LETTER" }) => {
      if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB limit");
      const isPdf = file.type === "application/pdf";
      const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx");
      if (!isPdf && !isDocx) throw new Error("Only PDF and DOCX files are allowed");

      const filenameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      const { document } = await api.uploadDocument(file, filenameWithoutExt, type, false);
      return { document, type };
    },
    onSuccess: ({ document, type }) => {
      toast.success("Document uploaded");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (type === "RESUME") {
        onUpdate({ resumeId: document.id });
      } else {
        onUpdate({ coverLetterId: document.id });
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to upload");
    },
  });

  const handleDrop = (e: React.DragEvent, type: "RESUME" | "COVER_LETTER") => {
    e.preventDefault();
    setDragType(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      uploadMutation.mutate({ file, type });
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto px-5 py-5 space-y-6 relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {uploadMutation.isPending && (
        <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border shadow-lg rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Uploading document...</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div 
          className={`relative p-3 -mx-3 rounded-lg border-2 transition-colors ${dragType === "RESUME" ? "border-primary bg-primary/5 border-dashed" : "border-transparent"}`}
          onDragEnter={(e) => { e.preventDefault(); setDragType("RESUME"); }}
          onDragOver={(e) => { e.preventDefault(); setDragType("RESUME"); }}
          onDragLeave={() => setDragType(null)}
          onDrop={(e) => handleDrop(e, "RESUME")}
        >
          {dragType === "RESUME" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md pointer-events-none">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Upload className="h-4 w-4" /> Drop to upload as Resume
              </div>
            </div>
          )}
          <Label className="mb-2 block">Resume</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <DocumentPicker
                type="RESUME"
                value={card.resumeId ?? null}
                onChange={(id) => onUpdate({ resumeId: id })}
              />
            </div>
            {card.resumeId && resume && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewingResume(!viewingResume)}
                title="Preview Resume"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {viewingResume && resume && (
            <div className="mt-4 border rounded-md overflow-hidden h-[400px]">
              {resume.mimeType === "application/pdf" ? (
                <PdfPreview url={`/api/documents/${resume.id}/url`} />
              ) : (
                <DocxPreview documentId={resume.id} />
              )}
            </div>
          )}
        </div>

        <div 
          className={`relative p-3 -mx-3 rounded-lg border-2 transition-colors ${dragType === "COVER_LETTER" ? "border-primary bg-primary/5 border-dashed" : "border-transparent"}`}
          onDragEnter={(e) => { e.preventDefault(); setDragType("COVER_LETTER"); }}
          onDragOver={(e) => { e.preventDefault(); setDragType("COVER_LETTER"); }}
          onDragLeave={() => setDragType(null)}
          onDrop={(e) => handleDrop(e, "COVER_LETTER")}
        >
          {dragType === "COVER_LETTER" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-md pointer-events-none">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <Upload className="h-4 w-4" /> Drop to upload as Cover Letter
              </div>
            </div>
          )}
          <Label className="mb-2 block">Cover Letter</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <DocumentPicker
                type="COVER_LETTER"
                value={card.coverLetterId ?? null}
                onChange={(id) => onUpdate({ coverLetterId: id })}
              />
            </div>
            {card.coverLetterId && coverLetter && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewingCoverLetter(!viewingCoverLetter)}
                title="Preview Cover Letter"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>

          {viewingCoverLetter && coverLetter && (
            <div className="mt-4 border rounded-md overflow-hidden h-[400px]">
              {coverLetter.mimeType === "application/pdf" ? (
                <PdfPreview url={`/api/documents/${coverLetter.id}/url`} />
              ) : (
                <DocxPreview documentId={coverLetter.id} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

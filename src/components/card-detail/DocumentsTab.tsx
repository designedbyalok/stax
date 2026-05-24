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

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-4 border-b">
            <h3 className="font-semibold leading-none tracking-tight">Application Packet Checklist</h3>
            <p className="text-sm text-muted-foreground">Ensure your materials are ready before applying.</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 rounded-full border ${card.matchScore != null ? 'bg-primary border-primary text-primary-foreground flex items-center justify-center' : 'border-muted-foreground'}`}>
                {card.matchScore != null && <Star className="w-2.5 h-2.5 fill-current" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Improve Your Resume Score</p>
                <p className="text-[13px] text-muted-foreground">
                  Your current match score is {card.matchScore ? <strong className="text-foreground">{card.matchScore}%</strong> : "Not analyzed"}. Run AI Tailor to optimize it.
                </p>
                {card.resumeId && (
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">Run AI Tailor</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 rounded-full border ${card.coverLetterId ? 'bg-primary border-primary text-primary-foreground flex items-center justify-center' : 'border-muted-foreground'}`}>
                {card.coverLetterId && <Star className="w-2.5 h-2.5 fill-current" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Review Cover Letter</p>
                <p className="text-[13px] text-muted-foreground">
                  Attach and review your cover letter for this role.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full border border-muted-foreground" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium leading-none">Download & Apply</p>
                <p className="text-[13px] text-muted-foreground">
                  Once ready, download your packet (Resume & Cover Letter) and apply.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-8 text-xs" 
                    disabled={!card.resumeId && !card.coverLetterId}
                    onClick={() => {
                      toast.info("Downloading packet...");
                      // Implementation for zip download would go here
                    }}
                  >
                    Download Packet
                  </Button>
                  {card.originalUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs" 
                      nativeButton={false}
                      render={<a href={card.originalUrl} target="_blank" rel="noreferrer" />}
                    >
                      Go to Job Post
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <PdfPreview documentId={resume.id} />
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
                <PdfPreview documentId={coverLetter.id} />
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

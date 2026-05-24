"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, FileText, ChevronRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { DocumentPicker } from "@/components/documents/DocumentPicker";
import { PdfPreview } from "@/components/documents/PdfPreview";
import { DocxPreview } from "@/components/documents/DocxPreview";
import { UploadModal } from "@/components/documents/UploadModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

export function DocumentsSection({
  applicationId,
  resumeId,
  coverLetterId,
}: {
  applicationId: string;
  resumeId: string | null;
  coverLetterId: string | null;
}) {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"RESUME" | "COVER_LETTER">("RESUME");
  const [previewId, setPreviewId] = useState<string | null>(null);

  // We need the full document object to know its mimeType for the preview
  const { data: resumeDoc } = useQuery({
    queryKey: ["document", resumeId],
    queryFn: () => resumeId ? api.getDocument(resumeId).then(r => r.document) : Promise.resolve(null),
    enabled: !!resumeId,
  });

  const { data: coverLetterDoc } = useQuery({
    queryKey: ["document", coverLetterId],
    queryFn: () => coverLetterId ? api.getDocument(coverLetterId).then(r => r.document) : Promise.resolve(null),
    enabled: !!coverLetterId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { resumeId?: string | null; coverLetterId?: string | null }) =>
      api.updateApplication(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const previewDoc = previewId === resumeId ? resumeDoc : previewId === coverLetterId ? coverLetterDoc : null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Documents</Label>
      </div>

      <div className="space-y-3 bg-muted/20 p-3 border rounded-md">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Resume</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DocumentPicker
                type="RESUME"
                value={resumeId}
                onChange={(id) => updateMutation.mutate({ resumeId: id })}
                onUploadClick={() => {
                  setUploadType("RESUME");
                  setUploadOpen(true);
                }}
              />
            </div>
            {resumeId && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-9 w-9 text-muted-foreground"
                onClick={() => setPreviewId(resumeId)}
                title="Preview resume"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-medium">Cover Letter</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DocumentPicker
                type="COVER_LETTER"
                value={coverLetterId}
                onChange={(id) => updateMutation.mutate({ coverLetterId: id })}
                onUploadClick={() => {
                  setUploadType("COVER_LETTER");
                  setUploadOpen(true);
                }}
              />
            </div>
            {coverLetterId && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-9 w-9 text-muted-foreground"
                onClick={() => setPreviewId(coverLetterId)}
                title="Preview cover letter"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultType={uploadType}
      />

      <Dialog open={!!previewId} onOpenChange={(open) => !open && setPreviewId(null)}>
        <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-4 gap-3">
          <DialogHeader className="px-1 shrink-0">
            <DialogTitle className="text-base truncate pr-6">{previewDoc?.name ?? "Preview"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewDoc?.mimeType === "application/pdf" ? (
              <DocUrlLoader documentId={previewDoc.id} />
            ) : previewDoc ? (
              <DocxPreview documentId={previewDoc.id} />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Small helper to load URL for PDF preview
function DocUrlLoader({ documentId }: { documentId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["documentUrl", documentId],
    queryFn: () => api.getDocumentUrl(documentId),
  });
  if (isLoading) return <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Loading preview...</div>;
  if (!data?.url) return <div className="flex items-center justify-center h-full text-sm text-destructive">Failed to load preview</div>;
  return <PdfPreview url={data.url} />;
}

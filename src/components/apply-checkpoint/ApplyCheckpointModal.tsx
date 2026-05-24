"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, CheckCircle2 } from "lucide-react";
import { api, ApiApplication } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentPicker } from "@/components/documents/DocumentPicker";
import { UploadModal } from "@/components/documents/UploadModal";

export function ApplyCheckpointModal({
  open,
  onOpenChange,
  card,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: ApiApplication;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [skipNext, setSkipNext] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(card.resumeId ?? null);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState<string | null>(card.coverLetterId ?? null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"RESUME" | "COVER_LETTER">("RESUME");

  // Fetch full document metadata for preview thumbnails
  const { data: resume } = useQuery({
    queryKey: ["document", selectedResumeId],
    queryFn: () => selectedResumeId ? api.getDocument(selectedResumeId).then(r => r.document) : Promise.resolve(null),
    enabled: !!selectedResumeId,
  });

  const { data: coverLetter } = useQuery({
    queryKey: ["document", selectedCoverLetterId],
    queryFn: () => selectedCoverLetterId ? api.getDocument(selectedCoverLetterId).then(r => r.document) : Promise.resolve(null),
    enabled: !!selectedCoverLetterId,
  });

  const handleConfirm = async () => {
    if (skipNext) {
      await api.updateUserSettings({ skipApplyCheckpoint: true });
    }
    if (selectedResumeId !== card.resumeId || selectedCoverLetterId !== card.coverLetterId) {
      await api.updateApplication(card.id, { 
        resumeId: selectedResumeId, 
        coverLetterId: selectedCoverLetterId 
      });
    }
    onConfirm();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) onCancel();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Ready to apply?</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div>
            <div className="text-sm font-medium mb-1">Role details</div>
            <div className="bg-muted/30 border rounded-md p-3 flex flex-col gap-1 text-sm">
              <span className="font-semibold">{card.companyName}</span>
              <span className="text-muted-foreground">{card.roleTitle}</span>
              {card.originalUrl && (
                <a
                  href={card.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 mt-1 text-xs"
                >
                  View original posting
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-1 flex items-center justify-between">
              Documents to send
            </div>
            <div className="space-y-2">
              {/* Resume */}
              {resume ? (
                <div className="flex items-center gap-3 p-2.5 border rounded-md bg-card">
                  <div className="w-8 h-10 bg-muted rounded-sm border shrink-0 flex flex-col items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{resume.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{resume.filename}</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2.5 border border-dashed rounded-md bg-muted/20">
                  <div className="flex-1">
                    <DocumentPicker
                      type="RESUME"
                      value={selectedResumeId}
                      onChange={setSelectedResumeId}
                      onUploadClick={() => { setUploadType("RESUME"); setUploadOpen(true); }}
                    />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">Missing</span>
                </div>
              )}

              {/* Cover Letter */}
              {coverLetter ? (
                <div className="flex items-center gap-3 p-2.5 border rounded-md bg-card">
                  <div className="w-8 h-10 bg-muted rounded-sm border shrink-0 flex flex-col items-center justify-center">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{coverLetter.name}</div>
                    <div className="text-xs text-muted-foreground truncate text-[10px] uppercase font-semibold">Cover Letter</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2.5 border border-dashed rounded-md bg-muted/20">
                  <div className="flex-1">
                    <DocumentPicker
                      type="COVER_LETTER"
                      value={selectedCoverLetterId}
                      onChange={setSelectedCoverLetterId}
                      onUploadClick={() => { setUploadType("COVER_LETTER"); setUploadOpen(true); }}
                    />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">Missing</span>
                </div>
              )}
            </div>
            
            {!resume && (
              <p className="text-xs text-amber-600/90 dark:text-amber-500/90 mt-2 font-medium">
                Tip: Attach a resume before moving to Applied to keep track of what you sent.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground self-start sm:self-auto order-last sm:order-first">
            <input
              type="checkbox"
              checked={skipNext}
              onChange={(e) => setSkipNext(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
            />
            Don't show this again
          </label>
          <div className="flex w-full sm:w-auto gap-2">
            <Button variant="ghost" onClick={() => handleOpenChange(false)} className="flex-1 sm:flex-none">
              Let me check first
            </Button>
            <Button onClick={handleConfirm} className="flex-1 sm:flex-none">
              Yes, mark as applied
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <UploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        defaultType={uploadType}
      />
    </Dialog>
  );
}

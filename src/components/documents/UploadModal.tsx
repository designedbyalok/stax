"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X, File, Loader2 } from "@/components/icons";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function UploadModal({
  open,
  onOpenChange,
  defaultType = "RESUME",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "RESUME" | "COVER_LETTER";
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"RESUME" | "COVER_LETTER">(defaultType);
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setName("");
    setType(defaultType);
    setNotes("");
    setIsPrimary(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) reset();
    onOpenChange(newOpen);
  };

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit");
      return;
    }
    
    const isPdf = selected.type === "application/pdf";
    const isDocx = selected.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                   selected.name.endsWith(".docx");
                   
    if (!isPdf && !isDocx) {
      toast.error("Only PDF and DOCX files are allowed");
      return;
    }

    setFile(selected);
    const filenameWithoutExt = selected.name.split('.').slice(0, -1).join('.');
    setName(filenameWithoutExt);
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("No file selected");
      if (!name.trim()) throw new Error("Name is required");
      return api.uploadDocument(file, name.trim(), type, isPrimary, notes || undefined);
    },
    onSuccess: () => {
      toast.success("Document uploaded");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      handleOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to upload");
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
        </DialogHeader>

        {!file ? (
          <div
            role="button"
            tabIndex={0}
            className={`mt-4 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF or DOCX (max 5MB)</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex items-start justify-between p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-3 overflow-hidden">
                <File className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-name">Name</Label>
              <Input
                id="doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="PM v3 - Growth Focus"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("RESUME")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    type === "RESUME" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => setType("COVER_LETTER")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    type === "COVER_LETTER" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Cover Letter
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-notes">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                id="doc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Which roles this targets..."
                className="resize-none h-20"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm font-medium">Set as primary</span>
            </label>
          </div>
        )}

        <div className="mt-2 pt-4 border-t flex justify-end gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!file || !name.trim() || uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
            className="w-24"
          >
            {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

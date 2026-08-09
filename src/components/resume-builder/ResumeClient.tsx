"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import { generateLatex } from "@/lib/resume-latex";
import { ApiResume, ResumeData } from "@/lib/types/resume";
import { ScaledBuilderPreview } from "./components/ScaledBuilderPreview";
import { ResumeDesignPanel } from "./ResumeDesignPanel";
import { ResumeEditorPanel } from "./ResumeEditorPanel";
import { ResumeLanding } from "./ResumeLanding";
import { serializeResume } from "./utils";
import "./resume-builder.css";

export function ResumeClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");

  const [activeResume, setActiveResume] = useState<ApiResume | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [missingResumeId, setMissingResumeId] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const savedSnapshotRef = useRef<string>("");
  const loadedIdRef = useRef<string | null>(null);

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      return data.resumes as ApiResume[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: {
      id: string;
      title?: string;
      content: ResumeData;
    }) => {
      const res = await fetch(`/api/resume/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update resume");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  useEffect(() => {
    if (resumesQuery.data) {
      if (resumeId) {
        const resume = resumesQuery.data.find((r) => r.id === resumeId);
        if (resume) {
          setMissingResumeId(null);
          setActiveResume((current) => (current?.id === resume.id ? current : resume));
        } else {
          setMissingResumeId(resumeId);
          toast.error("Resume not found");
        }
      }
    }
  }, [resumeId, resumesQuery.data]);

  const handleUpdateContent = (newContent: ResumeData) => {
    if (!activeResume) return;
    setActiveResume({ ...activeResume, content: newContent });
  };

  useEffect(() => {
    if (activeResume && loadedIdRef.current !== activeResume.id) {
      loadedIdRef.current = activeResume.id;
      savedSnapshotRef.current = serializeResume(activeResume);
      setSaveStatus("saved");
    }
  }, [activeResume]);

  useEffect(() => {
    if (!activeResume) return;
    const snapshot = serializeResume(activeResume);
    if (snapshot === savedSnapshotRef.current) return;

    setSaveStatus("unsaved");
    const resume = activeResume;
    const timer = setTimeout(() => {
      setSaveStatus("saving");
      updateMutation.mutate(
        { id: resume.id, title: resume.title, content: resume.content },
        {
          onSuccess: () => {
            savedSnapshotRef.current = snapshot;
            setSaveStatus("saved");
          },
          onError: () => setSaveStatus("unsaved"),
        }
      );
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResume]);

  if (resumesQuery.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resumeId) {
    return <ResumeLanding />;
  }

  if (missingResumeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-muted-foreground">That resume could not be found.</p>
        <Button render={<Link href="/documents" />}>Back to documents</Button>
      </div>
    );
  }

  if (!activeResume) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleExportToDocuments = async () => {
    try {
      setIsExporting(true);
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.getElementById("resume-preview-content");
      if (!element) throw new Error("Preview element not found");

      const opt = {
        margin: 0,
        filename: `${activeResume.content.basics.name || "Resume"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "in" as const,
          format: "letter" as const,
          orientation: "portrait" as const,
        },
      };

      const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

      const formData = new FormData();
      formData.append("file", new File([pdfBlob], opt.filename, { type: "application/pdf" }));
      formData.append("name", activeResume.title || "My Builder Resume");
      formData.append("type", "RESUME");
      formData.append("isPrimary", "false");
      formData.append("notes", `builder-resume-${activeResume.id}`);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      toast.success("Resume saved to Documents!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLatex = () => {
    if (!activeResume) return;
    try {
      const latexCode = generateLatex(activeResume.content);
      const blob = new Blob([latexCode], { type: "application/x-tex" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeResume.content.basics.name || "Resume"}.tex`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("LaTeX source downloaded!");
    } catch (err) {
      toast.error("Failed to generate LaTeX");
      console.error(err);
    }
  };

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="flex-1 h-full overflow-hidden bg-muted/20 print:block responsive-panels"
    >
      <ResumeEditorPanel
        activeResume={activeResume}
        setActiveResume={setActiveResume}
        saveStatus={saveStatus}
        handleUpdateContent={handleUpdateContent}
        isExporting={isExporting}
        handleExportToDocuments={handleExportToDocuments}
        handleExportLatex={handleExportLatex}
      />

      <ResizableHandle className="print:hidden responsive-handle" />

      <ResizablePanel
        defaultSize={45}
        className="flex flex-col h-full print:block responsive-panel min-h-[50vh] overflow-hidden bg-muted/20 print:p-0 print:bg-white print:overflow-visible relative"
      >
        <ScaledBuilderPreview resume={activeResume.content} />
      </ResizablePanel>

      <ResizableHandle className="print:hidden responsive-handle" />

      <ResumeDesignPanel
        activeResume={activeResume}
        handleUpdateContent={handleUpdateContent}
      />
    </ResizablePanelGroup>
  );
}

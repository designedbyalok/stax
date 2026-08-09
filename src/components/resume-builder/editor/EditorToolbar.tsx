"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, Printer, Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ApiResume } from "@/lib/types/resume";

interface EditorToolbarProps {
  activeResume: ApiResume;
  setActiveResume: React.Dispatch<React.SetStateAction<ApiResume | null>>;
  isExporting: boolean;
  handleExportToDocuments: () => void;
  handleExportLatex: () => void;
}

export function EditorToolbar({
  activeResume,
  setActiveResume,
  isExporting,
  handleExportToDocuments,
  handleExportLatex,
}: EditorToolbarProps) {
  const router = useRouter();

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-1.5 min-w-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 -ml-2 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/resume-builder")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <input
          value={activeResume.title}
          onChange={(e) =>
            setActiveResume({ ...activeResume, title: e.target.value })
          }
          placeholder="Untitled resume"
          aria-label="Resume title"
          className="font-semibold text-sm bg-transparent border border-transparent rounded px-1.5 py-0.5 -ml-1.5 min-w-0 flex-1 outline-none hover:bg-muted/50 focus:bg-muted/50 focus:border-border transition-colors"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1"
          variant="secondary"
          onClick={handleExportToDocuments}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save
        </Button>
        <Button size="sm" className="flex-1" onClick={() => window.print()}>
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print
        </Button>
        <Button
          size="sm"
          className="flex-1"
          variant="outline"
          onClick={handleExportLatex}
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          LaTeX
        </Button>
      </div>
    </section>
  );
}

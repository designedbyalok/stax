"use client";

import React from "react";
import { ResizablePanel } from "@/components/ui/resizable";
import { ApiResume, ResumeData } from "@/lib/types/resume";
import { SaveStatus } from "./components/SaveStatus";
import { EditorToolbar } from "./editor/EditorToolbar";
import { EducationSection } from "./editor/EducationSection";
import { ExtraSections } from "./editor/ExtraSections";
import { LinksSection } from "./editor/LinksSection";
import { PersonalInfoSection } from "./editor/PersonalInfoSection";
import { ProjectsSection } from "./editor/ProjectsSection";
import { SkillsSection } from "./editor/SkillsSection";
import { WorkSection } from "./editor/WorkSection";

interface ResumeEditorPanelProps {
  activeResume: ApiResume;
  setActiveResume: React.Dispatch<React.SetStateAction<ApiResume | null>>;
  saveStatus: "saved" | "saving" | "unsaved";
  handleUpdateContent: (newContent: ResumeData) => void;
  isExporting: boolean;
  handleExportToDocuments: () => void;
  handleExportLatex: () => void;
}

export function ResumeEditorPanel({
  activeResume,
  setActiveResume,
  saveStatus,
  handleUpdateContent,
  isExporting,
  handleExportToDocuments,
  handleExportLatex,
}: ResumeEditorPanelProps) {
  const sectionProps = { activeResume, handleUpdateContent };

  return (
    <ResizablePanel
      defaultSize={35}
      minSize={20}
      className="bg-card flex flex-col h-full z-10 shadow-sm print:hidden responsive-panel"
      style={{ maxWidth: 300 }}
    >
      <div className="p-4 border-b flex flex-col gap-3 shrink-0">
        <div className="text-xs text-muted-foreground flex items-center justify-between">
          <SaveStatus status={saveStatus} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
        <EditorToolbar
          activeResume={activeResume}
          setActiveResume={setActiveResume}
          isExporting={isExporting}
          handleExportToDocuments={handleExportToDocuments}
          handleExportLatex={handleExportLatex}
        />
        <PersonalInfoSection {...sectionProps} />
        <LinksSection {...sectionProps} />
        <WorkSection {...sectionProps} />
        <SkillsSection {...sectionProps} />
        <EducationSection {...sectionProps} />
        <ProjectsSection {...sectionProps} />
        <ExtraSections {...sectionProps} />
      </div>
    </ResizablePanel>
  );
}

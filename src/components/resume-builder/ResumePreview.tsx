"use client";

import React from "react";
import { resolveFont } from "@/lib/resume-fonts";
import { useGoogleResumeFont } from "@/lib/resume-font-loader";
import { ClassicTemplate } from "./preview/ClassicTemplate";
import { CompactTemplate } from "./preview/CompactTemplate";
import { ElegantTemplate } from "./preview/ElegantTemplate";
import { MinimalTemplate } from "./preview/MinimalTemplate";
import { ModernTemplate } from "./preview/ModernTemplate";
import { ProfessionalTemplate } from "./preview/ProfessionalTemplate";
import { SplitTemplate } from "./preview/SplitTemplate";
import type { ResumePreviewProps, ResolvedDesign } from "./preview/types";

const TEMPLATES = {
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  professional: ProfessionalTemplate,
  elegant: ElegantTemplate,
  compact: CompactTemplate,
  split: SplitTemplate,
  classic: ClassicTemplate,
} as const;

function ResumePreviewImpl({ resume }: ResumePreviewProps) {
  const design: ResolvedDesign = {
    template: resume.design?.template ?? "classic",
    themeColor: resume.design?.themeColor ?? "#0f172a",
    fontFamily: resume.design?.fontFamily ?? "sans",
    spacing: resume.design?.spacing ?? 1,
    backgroundColor: resume.design?.backgroundColor,
    textColor: resume.design?.textColor,
  };

  const { font, cssFamily } = resolveFont(design.fontFamily);
  const themeColor = design.themeColor || "#0f172a";
  const bgColor = design.backgroundColor || "#ffffff";
  const textColor = design.textColor || "#27272a";

  const rootStyle = {
    "--theme-color": themeColor,
    "--text-color": textColor,
    backgroundColor: bgColor,
    color: textColor,
    fontFamily: cssFamily,
  } as React.CSSProperties;

  useGoogleResumeFont(font.name);

  const s = (val: number) => `${val * design.spacing}rem`;

  const templateKey = design.template as keyof typeof TEMPLATES;
  const Template = TEMPLATES[templateKey] ?? ClassicTemplate;

  return (
    <Template
      resume={resume}
      rootStyle={rootStyle}
      themeColor={themeColor}
      design={design}
      s={s}
    />
  );
}

export const ResumePreview = React.memo(ResumePreviewImpl);

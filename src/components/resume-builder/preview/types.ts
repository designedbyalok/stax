import type { CSSProperties } from "react";
import type { ResumeData } from "@/lib/types/resume";

export interface ResumePreviewProps {
  resume: ResumeData;
}

export interface ResolvedDesign {
  template: string;
  themeColor: string;
  fontFamily: string;
  spacing: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface TemplateProps {
  resume: ResumeData;
  rootStyle: CSSProperties;
  themeColor: string;
  design: ResolvedDesign;
  s: (val: number) => string;
}

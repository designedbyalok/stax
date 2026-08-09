import { ApiResume, ResumeData } from "@/lib/types/resume";

export interface SectionEditorProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

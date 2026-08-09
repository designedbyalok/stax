// Shared "Review the details" modal types — used by both the paste flow
// (PreviewCard) and the manual flow (ManualEntryForm).

export type ReviewDraft = {
  roleTitle: string;
  companyName: string;
  location: string;
  salaryRange: string;
  jobType: "" | "FULL_TIME" | "CONTRACT" | "INTERNSHIP" | "PART_TIME" | "OTHER";
  originalUrl: string;
};

export type ReviewMode = "paste" | "manual";

export type ReviewDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ReviewMode;
  /** Initial form values. Re-applied whenever the modal opens. */
  initialDraft: Partial<ReviewDraft>;
  /** Field names that AI was uncertain about (paste mode only). */
  uncertainFields?: string[];
  /** Field names that came pre-filled from AI (paste mode only). */
  aiFilledFields?: string[];
  /** Source platform (LINKEDIN / etc) — paste mode. */
  source?: string;
  /** Company logo URL extracted from the post (paste mode). */
  companyLogoUrl?: string | null;
  /** Job description from the parser — saved but not edited here. */
  jobDescription?: string | null;
  isPending: boolean;
  onSave: (data: {
    draft: ReviewDraft;
    columnId: string;
    companyLogoUrl: string | null;
    jobDescription: string | null;
  }) => void;
};

export const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "GREENHOUSE", label: "Greenhouse" },
  { value: "LEVER", label: "Lever" },
  { value: "WORKDAY", label: "Workday" },
  { value: "INDEED", label: "Indeed" },
  { value: "OTHER", label: "Web" },
  { value: "MANUAL", label: "Manual entry" },
];

// Sentinel sent through the Select primitive in place of an empty
// string, since some shadcn/base-ui Select implementations refuse
// to accept value="" on a SelectItem.
export const NONE = "__none__";

export const JOB_TYPE_OPTIONS: { value: ReviewDraft["jobType"]; label: string }[] = [
  { value: "", label: "—" },
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "OTHER", label: "Other" },
];

export function normalizeDraft(d: Partial<ReviewDraft>): ReviewDraft {
  return {
    roleTitle: d.roleTitle ?? "",
    companyName: d.companyName ?? "",
    location: d.location ?? "",
    salaryRange: d.salaryRange ?? "",
    jobType: (d.jobType ?? "") as ReviewDraft["jobType"],
    originalUrl: d.originalUrl ?? "",
  };
}

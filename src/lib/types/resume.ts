export interface ResumeData {
  basics: {
    name: string;
    /** JSON-Resume style job label (e.g. "Product Designer"). */
    label?: string;
    /** Personal site / portfolio URL (JSON-Resume `url`). */
    url?: string;
    email: string;
    phone: string;
    location: string;
    /** Primary title line. Optional — `label` may be used instead. */
    headline?: string;
    summary: string;
    /** Website + social links (LinkedIn, GitHub, portfolio, etc.). */
    links?: Array<{ id: string; label: string; url: string }>;
  };
  work: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    summary: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    studyType: string;
    area: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    url?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    fluency: string;
  }>;
  awards?: Array<{
    id: string;
    title: string;
    awarder: string;
    date: string;
  }>;
  publications?: Array<{
    id: string;
    name: string;
    publisher: string;
    date: string;
    url?: string;
  }>;
  volunteer?: Array<{
    id: string;
    organization: string;
    position: string;
    startDate: string;
    endDate: string;
    summary: string;
  }>;
  interests?: Array<{
    id: string;
    name: string;
    keywords?: string;
  }>;
  references?: Array<{
    id: string;
    name: string;
    reference: string;
  }>;
  /** User-defined sections — title + any number of free-form items.
   *  Each item supports the common resume-row shape (title/subtitle/
   *  date/description) so it can stand in for things the canonical
   *  sections don't cover. */
  customSections?: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      title?: string;
      subtitle?: string;
      date?: string;
      description?: string;
    }>;
  }>;
  design?: {
    template: string;
    themeColor: string;
    fontFamily: string;
    spacing: number;
    /** Resume page background color. Defaults to white. */
    backgroundColor?: string;
    /** Primary body/heading ("ink") text color. Defaults to near-black. */
    textColor?: string;
  };
}

/** Available resume layout templates, in display order. */
export const RESUME_TEMPLATES = [
  "classic",
  "modern",
  "minimal",
  "professional",
  "elegant",
  "compact",
  "split",
] as const;

/** Recognized link platforms offered in the builder. `label` is what shows
 *  on the resume; "Custom" lets the user type their own label. */
export const LINK_PLATFORMS = [
  "LinkedIn",
  "GitHub",
  "X (Twitter)",
  "Portfolio",
  "Website",
  "Dribbble",
  "Behance",
  "Stack Overflow",
  "Medium",
  "Dev.to",
  "YouTube",
  "Instagram",
  "Custom",
] as const;

export interface ApiResume {
  id: string;
  userId: string;
  title: string;
  content: ResumeData;
  createdAt: string;
  updatedAt: string;
}

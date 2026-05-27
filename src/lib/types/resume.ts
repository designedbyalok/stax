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
  design?: {
    template: string;
    themeColor: string;
    fontFamily: string;
    spacing: number;
  };
}

export interface ApiResume {
  id: string;
  userId: string;
  title: string;
  content: ResumeData;
  createdAt: string;
  updatedAt: string;
}

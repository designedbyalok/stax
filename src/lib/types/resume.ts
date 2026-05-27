export interface ResumeData {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    headline: string;
    summary: string;
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

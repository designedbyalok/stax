// Shape of Application.matchDetails (written by the AI Tailor flow).
export type MatchDetails = {
  score: number;
  summary: string;
  matchedSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
  generatedAt: string;
};

export type ApiApplication = {
  id: string;
  userId: string;
  columnId: string;
  position: number;
  roleTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  logoColor: string | null;
  location: string | null;
  salaryRange: string | null;
  jobType: string | null;
  originalUrl: string | null;
  sourcePlatform: string | null;
  jobDescription: string | null;
  tldrHeadline: string | null;
  tldrBullets: string[] | null;
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
  matchScore: number | null;
  matchDetails: Record<string, unknown> | null;
  notes: string | null;
  resumeVersion: string | null;
  coverLetterVersion: string | null;
  resumeId: string | null;
  coverLetterId: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  appliedAt: string | null;
  archivedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiColumn = {
  id: string;
  userId: string;
  name: string;
  position: number;
  color: string;
  isArchive: boolean;
  isInterviewStage: boolean;
  createdAt: string;
};

export type ApiContact = {
  id: string;
  applicationId: string;
  name: string;
  role: "RECRUITER" | "HIRING_MANAGER" | "REFERRER" | "OTHER";
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
};

export type ApiActivity = {
  id: string;
  applicationId: string;
  type:
    | "CREATED"
    | "STATUS_CHANGED"
    | "CONTACT_ADDED"
    | "NOTE_ADDED"
    | "USER_EVENT"
    | "EMAIL_RECEIVED";
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ApiDocument = {
  id: string;
  userId: string;
  type: "RESUME" | "COVER_LETTER";
  name: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  notes: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { resumeApplications: number; coverLetterApplications: number };
};

export type ApiEmailEvent = {
  id: string;
  userId: string;
  applicationId: string | null;
  messageId: string;
  senderEmail: string;
  senderName: string | null;
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  intent: "INTERVIEW_INVITE" | "REJECTION" | "OFFER" | "OUTREACH" | "GENERIC";
  autoAttached: boolean;
  matchConfidence: number | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiGoogleIntegration = {
  id: string;
  email: string;
  createdAt: string;
};

export type ApiCalendarEvent = {
  id: string;
  userId: string;
  applicationId: string;
  googleEventId: string;
  title: string;
  startTime: string;
  endTime: string;
  meetLink: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  application?: ApiApplication;
};

export type ApiInterviewQuestion = {
  id: string;
  userId: string;
  applicationId: string | null;
  question: string;
  yourAnswer: string | null;
  tags: string[];
  isFrequent: boolean;
  createdAt: string;
  application?: ApiApplication;
};

export type ApiStarStory = {
  id: string;
  userId: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
  workedWell: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApiInterviewChecklist = {
  id: string;
  applicationId: string;
  items: Array<{ text: string; checked: boolean }>;
  notes: string | null;
  reflection: string | null;
  questionsToAsk: Array<{ text: string }>;
};

export type ApiApplicationDetail = ApiApplication & {
  contacts: ApiContact[];
  activities: ApiActivity[];
  resume: ApiDocument | null;
  coverLetter: ApiDocument | null;
  emailEvents: ApiEmailEvent[];
  calendarEvents: ApiCalendarEvent[];
  checklist?: ApiInterviewChecklist | null;
  questions?: ApiInterviewQuestion[];
};

export type ApiReminder = {
  id: string;
  type:
    | "AUTO_FOLLOWUP"
    | "NEXT_ACTION_DUE"
    | "STALE_APPLICATION"
    | "CUSTOM"
    | "INTERVIEW_PREP_DUE";
  status: "PENDING" | "SNOOZED" | "DISMISSED" | "COMPLETED";
  dueAt: string;
  snoozedUntil: string | null;
  message: string | null;
  application: {
    id: string;
    roleTitle: string;
    companyName: string;
    columnName: string;
  };
};

export type ApiUserWithIntegrations = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  timezone: string;
  inboundEmailToken: string | null;
  googleIntegration: ApiGoogleIntegration | null;
};

export type ApiUserSettings = {
  digestEnabled: boolean;
  digestDay: number;
  digestHour: number;
  staleDaysApplied: number;
  staleDaysInterview: number;
  skipApplyCheckpoint: boolean;
  name?: string;
  email?: string;
  timezone?: string;
};

// --- V3: User Profile + Career Insights ---

export type ProfileCompletionField =
  | "name"
  | "photo"
  | "jobRole"
  | "city"
  | "country"
  | "yearsExperience"
  | "currentSalary"
  | "bio";

export type ApiProfileCompletion = {
  percent: number;
  completed: ProfileCompletionField[];
  missing: { key: ProfileCompletionField; label: string }[];
  weights: Record<ProfileCompletionField, number>;
};

export type ApiProfile = {
  id: string;
  userId: string;
  name: string | null;
  jobRole: string | null;
  jobFamily: string | null;
  city: string | null;
  country: string | null;
  yearsExperience: number | null;
  currentSalary: number | null;
  salaryCurrency: string | null;
  photoUrl: string | null;
  bio: string | null;
  onboardingStep: number;
  onboardingCompletedAt: string | null;
  onboardingSkippedAt: string | null;
  createdAt: string;
  updatedAt: string;
  completion: ApiProfileCompletion;
};

export type ApiSalaryDistribution = {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  median: number;
  sampleSize: number;
  source: "community" | "benchmark" | "ai";
  currency: string;
};

export type ApiSalaryPosition = {
  percentile: number;
  label: string;
};

export type ApiInsights =
  | { needsProfile: true }
  | {
      needsProfile?: false;
      role: string;
      city: string | null;
      country: string;
      scope: "city" | "country";
      bracket: "0-2" | "3-5" | "6-9" | "10+";
      comparableCount: number;
      comparableIsReal: boolean;
      distribution: ApiSalaryDistribution | null;
      position: ApiSalaryPosition | null;
      currency: string | null;
      source: "community" | "benchmark" | "ai" | null;
      refreshedAt: string;
    };

export type ProfilePatch = Partial<{
  name: string | null;
  jobRole: string | null;
  jobFamily: string | null;
  city: string | null;
  country: string | null;
  yearsExperience: number | null;
  currentSalary: number | null;
  salaryCurrency: string | null;
  bio: string | null;
  onboardingStep: number;
  onboardingCompleted: boolean;
  onboardingSkipped: boolean;
}>;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export type ParseResponse = {
  success: boolean;
  partial: boolean;
  source: string;
  fields: {
    roleTitle?: string;
    companyName?: string;
    location?: string;
    salaryRange?: string;
    jobDescription?: string;
    companyLogoUrl?: string;
  };
  uncertainFields: string[];
  originalUrl: string;
  error?: string;
  duplicate: null | {
    id: string;
    roleTitle: string;
    companyName: string;
    columnId: string;
    createdAt: string;
  };
};

export const api = {
  parseUrl: (url: string) =>
    request<ParseResponse>("/api/parse/url", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
  listColumns: () => request<{ columns: ApiColumn[] }>("/api/columns"),
  listApplications: () => request<{ applications: ApiApplication[] }>("/api/applications"),
  createApplication: (data: {
    roleTitle: string;
    companyName: string;
    location?: string | null;
    salaryRange?: string | null;
    jobType?: "FULL_TIME" | "CONTRACT" | "INTERNSHIP" | "PART_TIME" | "OTHER" | null;
    originalUrl?: string | null;
    jobDescription?: string | null;
    companyLogoUrl?: string | null;
    sourcePlatform?: string | null;
    columnId?: string;
  }) =>
    request<{ application: ApiApplication }>("/api/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateApplication: (
    id: string,
    data: Partial<Pick<
      ApiApplication,
      "roleTitle" | "companyName" | "location" | "salaryRange" | "originalUrl" | "notes" | "nextAction" | "resumeVersion" | "coverLetterVersion" | "resumeId" | "coverLetterId"
    >>
  ) =>
    request<{ application: ApiApplication }>(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteApplication: (id: string) =>
    request<{ ok: true }>(`/api/applications/${id}`, { method: "DELETE" }),
  tailorApplication: (id: string) =>
    request<{ matchScore: number; matchDetails: MatchDetails }>(
      `/api/applications/${id}/tailor`,
      { method: "POST" }
    ),
  moveApplication: (id: string, data: { columnId: string; beforeId?: string | null }) =>
    request<{ ok: true }>(`/api/applications/${id}/move`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getApplicationDetail: (id: string) =>
    request<{ application: ApiApplicationDetail }>(`/api/applications/${id}`),
  // Contacts
  createContact: (
    applicationId: string,
    data: {
      name: string;
      role?: ApiContact["role"];
      email?: string | null;
      phone?: string | null;
      notes?: string | null;
    }
  ) =>
    request<{ contact: ApiContact }>(`/api/applications/${applicationId}/contacts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateContact: (id: string, data: Partial<Omit<ApiContact, "id" | "applicationId" | "createdAt">>) =>
    request<{ contact: ApiContact }>(`/api/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteContact: (id: string) =>
    request<{ ok: true }>(`/api/contacts/${id}`, { method: "DELETE" }),
  // Activities
  createActivity: (applicationId: string, description: string) =>
    request<{ activity: ApiActivity }>(`/api/applications/${applicationId}/activities`, {
      method: "POST",
      body: JSON.stringify({ description }),
    }),
  // Reminders
  listReminders: () => request<{ reminders: ApiReminder[] }>("/api/reminders"),
  snoozeReminder: (id: string, days: number) =>
    request<{ ok: true }>(`/api/reminders/${id}/snooze`, {
      method: "POST",
      body: JSON.stringify({ days }),
    }),
  dismissReminder: (id: string) =>
    request<{ ok: true }>(`/api/reminders/${id}/dismiss`, { method: "POST" }),
  runRemindersDetection: () =>
    request<{ ok: true; created: number }>("/api/reminders/run", {
      method: "POST",
    }),
  // Columns CRUD
  createColumn: (data: { name: string; color?: string }) =>
    request<{ column: ApiColumn }>("/api/columns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateColumn: (id: string, data: { name?: string; color?: string; position?: number }) =>
    request<{ column: ApiColumn }>(`/api/columns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteColumn: (id: string) =>
    request<{ ok: true }>(`/api/columns/${id}`, { method: "DELETE" }),
  // User settings
  getUserSettings: () => request<ApiUserSettings>("/api/user/settings"),
  updateUserSettings: (data: Partial<ApiUserSettings>) =>
    request<ApiUserSettings>("/api/user/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  // Trash
  listTrash: () => request<{ applications: ApiApplication[] }>("/api/applications/trash"),
  // Documents
  listDocuments: (type?: "RESUME" | "COVER_LETTER") =>
    request<{ documents: ApiDocument[] }>(
      `/api/documents${type ? `?type=${type}` : ""}`
    ),
  uploadDocument: (file: File, name: string, type: "RESUME" | "COVER_LETTER", isPrimary: boolean, notes?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("isPrimary", String(isPrimary));
    if (notes) formData.append("notes", notes);
    return fetch("/api/documents/upload", { method: "POST", body: formData }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }
      return res.json() as Promise<{ document: ApiDocument }>;
    });
  },
  getDocument: (id: string) =>
    request<{ document: ApiDocument }>(`/api/documents/${id}`),
  updateDocument: (id: string, data: Partial<Pick<ApiDocument, "name" | "notes" | "isPrimary">>) =>
    request<{ document: ApiDocument }>(`/api/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteDocument: (id: string) =>
    request<{ ok: true; affectedCards: string[] }>(`/api/documents/${id}`, { method: "DELETE" }),
  getDocumentUrl: (id: string) =>
    request<{ url: string }>(`/api/documents/${id}/url`),
  getDocxPreview: (id: string) =>
    request<{ html: string }>(`/api/documents/${id}/preview`),
  // Emails
  listUnmatchedEmails: () => 
    request<{ emails: ApiEmailEvent[] }>("/api/emails/unmatched"),
  getEmailEvent: (id: string) =>
    request<{ emailEvent: ApiEmailEvent }>(`/api/emails/${id}`),
  updateEmailEvent: (id: string, data: Partial<Pick<ApiEmailEvent, "applicationId">>) =>
    request<{ emailEvent: ApiEmailEvent }>(`/api/emails/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteEmailEvent: (id: string) =>
    request<{ ok: true }>(`/api/emails/${id}`, { method: "DELETE" }),
  // Calendar
  disconnectGoogleCalendar: () =>
    request<{ ok: true }>("/api/integrations/google-calendar/disconnect", { method: "POST" }),
  createCalendarEvent: (applicationId: string, data: { title: string; startTime: string; endTime: string; notes?: string; addMeet?: boolean }) =>
    request<{ event: ApiCalendarEvent }>(`/api/cards/${applicationId}/calendar-event`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  listCalendarEvents: () =>
    request<{ events: ApiCalendarEvent[] }>("/api/calendar-events"),
    
  // Interview Prep
  getPrepChecklist: (applicationId: string) =>
    request<{ checklist: ApiInterviewChecklist }>(`/api/prep/${applicationId}`),
  updatePrepChecklist: (applicationId: string, data: Partial<ApiInterviewChecklist>) =>
    request<{ checklist: ApiInterviewChecklist }>(`/api/prep/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
    
  // Library: Questions
  listQuestions: () =>
    request<{ questions: ApiInterviewQuestion[] }>("/api/library/questions"),
  createQuestion: (data: Partial<ApiInterviewQuestion>) =>
    request<{ question: ApiInterviewQuestion }>("/api/library/questions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateQuestion: (id: string, data: Partial<ApiInterviewQuestion>) =>
    request<{ question: ApiInterviewQuestion }>(`/api/library/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteQuestion: (id: string) =>
    request<{ ok: true }>(`/api/library/questions/${id}`, { method: "DELETE" }),
    
  // Library: STAR Stories
  listStories: () =>
    request<{ stories: ApiStarStory[] }>("/api/library/stories"),
  createStory: (data: Partial<ApiStarStory>) =>
    request<{ story: ApiStarStory }>("/api/library/stories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStory: (id: string, data: Partial<ApiStarStory>) =>
    request<{ story: ApiStarStory }>(`/api/library/stories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteStory: (id: string) =>
    request<{ ok: true }>(`/api/library/stories/${id}`, { method: "DELETE" }),

  // Profile + Career Insights
  getProfile: () => request<{ profile: ApiProfile }>("/api/profile"),
  updateProfile: (patch: ProfilePatch) =>
    request<{ profile: ApiProfile }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch("/api/profile/photo", { method: "POST", body: formData }).then(
      async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Upload failed (${res.status})`);
        }
        return res.json() as Promise<{ photoUrl: string }>;
      }
    );
  },
  getRoles: () => request<{ roles: string[] }>("/api/options/roles"),
  getInsights: (params?: { role?: string; city?: string; scope?: "city" | "country"; refresh?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.role) qs.set("role", params.role);
    if (params?.city) qs.set("city", params.city);
    if (params?.scope) qs.set("scope", params.scope);
    if (params?.refresh) {
      qs.set("refresh", "1");
      qs.set("t", Date.now().toString()); // Cache buster
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<ApiInsights>(`/api/insights${suffix}`);
  },
};

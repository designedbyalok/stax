export type ApiApplication = {
  id: string;
  userId: string;
  columnId: string;
  position: number;
  roleTitle: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string | null;
  salaryRange: string | null;
  jobType: string | null;
  originalUrl: string | null;
  sourcePlatform: string | null;
  jobDescription: string | null;
  notes: string | null;
  resumeVersion: string | null;
  coverLetterVersion: string | null;
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
  createdAt: string;
};

export type ApiContact = {
  id: string;
  applicationId: string;
  name: string;
  role: "RECRUITER" | "HIRING_MANAGER" | "REFERRER" | "OTHER";
  email: string | null;
  notes: string | null;
  createdAt: string;
};

export type ApiActivity = {
  id: string;
  applicationId: string;
  type: "CREATED" | "STATUS_CHANGED" | "CONTACT_ADDED" | "NOTE_ADDED" | "USER_EVENT";
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ApiApplicationDetail = ApiApplication & {
  contacts: ApiContact[];
  activities: ApiActivity[];
};

export type ApiStatsSummary = {
  totalActive: number;
  appliedThisWeek: number;
  awaitingResponse: number;
  upcomingInterviews: number;
};

export type ApiReminder = {
  id: string;
  type: "AUTO_FOLLOWUP" | "NEXT_ACTION_DUE";
  status: "PENDING" | "SNOOZED" | "DISMISSED" | "COMPLETED";
  dueAt: string;
  snoozedUntil: string | null;
  application: {
    id: string;
    roleTitle: string;
    companyName: string;
    columnName: string;
  };
};

export type ApiUserSettings = {
  digestEnabled: boolean;
  digestDay: number;
  digestHour: number;
  staleDaysApplied: number;
  staleDaysInterview: number;
  name?: string;
  email?: string;
  timezone?: string;
};

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
      "roleTitle" | "companyName" | "location" | "salaryRange" | "originalUrl" | "notes" | "nextAction" | "resumeVersion" | "coverLetterVersion"
    >>
  ) =>
    request<{ application: ApiApplication }>(`/api/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteApplication: (id: string) =>
    request<{ ok: true }>(`/api/applications/${id}`, { method: "DELETE" }),
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
  // Stats
  getStatsSummary: () => request<ApiStatsSummary>("/api/stats/summary"),
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
};

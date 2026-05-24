"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink } from "lucide-react";
import { ContactsList } from "./ContactsList";
import { CalendarSection } from "./CalendarSection";
import { Timeline } from "./Timeline";
import { ApiApplication, ApiApplicationDetail } from "@/lib/api-client";

function toDateInputValue(isoString?: string | null) {
  if (!isoString) return "";
  return isoString.split("T")[0];
}

const SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  COMPANY_SITE: "Company Site",
  REFERRAL: "Referral",
};

export function OverviewTab({
  card,
  detail,
  draft,
  updateField,
}: {
  card: ApiApplication;
  detail: ApiApplicationDetail | null | undefined;
  draft: Partial<ApiApplicationDetail>;
  updateField: (key: string, value: unknown) => void;
}) {
  const sourceLabel = card.sourcePlatform ? SOURCE_LABEL[card.sourcePlatform] : null;

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="card-location">Location</Label>
          <Input
            id="card-location"
            value={draft.location ?? ""}
            onChange={(e) => updateField("location", e.target.value || null)}
            placeholder="—"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="card-salary">Salary</Label>
          <Input
            id="card-salary"
            value={draft.salaryRange ?? ""}
            onChange={(e) => updateField("salaryRange", e.target.value || null)}
            placeholder="—"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Next action</Label>
        <div className="flex gap-2">
          <Input
            value={draft.nextAction ?? ""}
            onChange={(e) => updateField("nextAction", e.target.value || null)}
            placeholder="Follow up with Sarah"
            className="flex-1"
          />
          <Input
            type="date"
            value={toDateInputValue(draft.nextActionDate)}
            onChange={(e) => {
              const v = e.target.value;
              updateField(
                "nextActionDate",
                v ? new Date(v + "T00:00:00").toISOString() : null
              );
            }}
            className="w-[140px]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="card-notes">Notes</Label>
        <Textarea
          id="card-notes"
          value={draft.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value || null)}
          placeholder="Add notes about this role…"
          className="min-h-[120px]"
        />
      </div>

      <ContactsList
        applicationId={card.id}
        contacts={detail?.contacts ?? []}
      />

      <CalendarSection
        applicationId={card.id}
        companyName={draft.companyName ?? card.companyName}
        events={detail?.calendarEvents ?? []}
      />

      <Timeline
        applicationId={card.id}
        activities={detail?.activities ?? []}
        emailEvents={detail?.emailEvents ?? []}
      />

      <div className="space-y-1.5">
        <Label>Source</Label>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="text-foreground">{sourceLabel || "Added manually"}</span>
          {card.originalUrl && (
            <>
              <span className="opacity-50">·</span>
              <a
                href={card.originalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
              >
                View posting
                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

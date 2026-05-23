"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiApplication } from "@/lib/api-client";
import { ContactsList } from "./ContactsList";
import { Timeline } from "./Timeline";

const SOURCE_LABEL: Record<string, string> = {
  LINKEDIN: "LinkedIn",
  GREENHOUSE: "Greenhouse",
  LEVER: "Lever",
  WORKDAY: "Workday",
  INDEED: "Indeed",
  OTHER: "Web",
  MANUAL: "Added manually",
};

type DraftFields = Pick<
  ApiApplication,
  | "roleTitle"
  | "companyName"
  | "location"
  | "salaryRange"
  | "notes"
  | "nextAction"
  | "nextActionDate"
  | "originalUrl"
>;

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function CardDrawer({
  card,
  isOpen,
  onClose,
}: {
  card: ApiApplication | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftFields | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch full detail (contacts + activities) when drawer opens.
  const detailQuery = useQuery({
    queryKey: ["application", card?.id],
    queryFn: () =>
      card ? api.getApplicationDetail(card.id).then((r) => r.application) : Promise.reject(),
    enabled: !!card && isOpen,
  });

  useEffect(() => {
    if (card) {
      setDraft({
        roleTitle: card.roleTitle,
        companyName: card.companyName,
        location: card.location,
        salaryRange: card.salaryRange,
        notes: card.notes,
        nextAction: card.nextAction,
        nextActionDate: card.nextActionDate,
        originalUrl: card.originalUrl,
      });
    } else {
      setDraft(null);
    }
  }, [card]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<DraftFields>) =>
      card
        ? api.updateApplication(card.id, data)
        : Promise.reject(new Error("No card")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      if (card) queryClient.invalidateQueries({ queryKey: ["application", card.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't save changes.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      card ? api.deleteApplication(card.id) : Promise.reject(new Error("No card")),
    onSuccess: () => {
      toast.success("Card deleted.");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't delete card.");
    },
  });

  function updateField<K extends keyof DraftFields>(key: K, value: DraftFields[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateMutation.mutate({ [key]: value } as Partial<DraftFields>);
    }, 500);
  }

  if (!card || !draft) return null;

  const sourceLabel = card.sourcePlatform ? SOURCE_LABEL[card.sourcePlatform] : null;
  const detail = detailQuery.data;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="!w-[440px] sm:!max-w-[440px] p-0 gap-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-4 border-b space-y-2.5">
          <SheetTitle className="sr-only">{card.roleTitle}</SheetTitle>
          <SheetDescription className="sr-only">{card.companyName}</SheetDescription>

          <div className="space-y-1.5">
            <Label htmlFor="card-role">Role</Label>
            <Input
              id="card-role"
              value={draft.roleTitle}
              onChange={(e) => updateField("roleTitle", e.target.value)}
              className="text-[15px] font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="card-company">Company</Label>
            <Input
              id="card-company"
              value={draft.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
            />
          </div>
        </SheetHeader>

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

          <Timeline
            applicationId={card.id}
            activities={detail?.activities ?? []}
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

        <div className="px-5 py-3 border-t flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-muted-foreground">
            {updateMutation.isPending ? "Saving…" : "Saved"}
          </span>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirm("Delete this card? You can restore it within 30 days.")) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mail, Phone, Trash2, Copy } from "@/components/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { api, ApiContact } from "@/lib/api-client";

const ROLE_LABEL: Record<ApiContact["role"], string> = {
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring manager",
  REFERRER: "Referrer",
  OTHER: "Other",
};

const ROLE_OPTIONS: ApiContact["role"][] = [
  "RECRUITER",
  "HIRING_MANAGER",
  "REFERRER",
  "OTHER",
];

export function ContactsList({
  applicationId,
  contacts,
}: {
  applicationId: string;
  contacts: ApiContact[];
}) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    role: "OTHER" as ApiContact["role"],
    email: "",
    phone: "",
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
  }

  const createMutation = useMutation({
    mutationFn: () =>
      api.createContact(applicationId, {
        name: draft.name.trim(),
        role: draft.role,
        email: draft.email.trim() || null,
        phone: draft.phone.trim() || null,
      }),
    onSuccess: () => {
      invalidate();
      setDraft({ name: "", role: "OTHER", email: "", phone: "" });
      setAdding(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't add contact.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteContact(id),
    onSuccess: invalidate,
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Couldn't delete contact.");
    },
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Contacts</Label>
        {!adding && (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Add
          </Button>
        )}
      </div>

      {contacts.length === 0 && !adding && (
        <p className="text-[12px] text-muted-foreground">
          No contacts yet.
        </p>
      )}

      <div className="space-y-1.5">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="group flex items-start gap-2 px-2.5 py-2 rounded-md border bg-card hover:border-foreground/15 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-[11px] font-medium text-foreground shrink-0 mt-0.5">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[13px] font-medium truncate">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {ROLE_LABEL[c.role]}
                </span>
              </div>
              {c.email && (
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                  <Mail className="h-2.5 w-2.5" />
                  <a href={`mailto:${c.email}`} className="hover:text-foreground hover:underline">
                    {c.email}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(c.email!);
                      toast.success("Copied email");
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                    title="Copy email"
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                  <Phone className="h-2.5 w-2.5" />
                  <a href={`tel:${c.phone}`} className="hover:text-foreground hover:underline">
                    {c.phone}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(c.phone!);
                      toast.success("Copied phone number");
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                    title="Copy phone"
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
            </div>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
              onClick={() => deleteMutation.mutate(c.id)}
              disabled={deleteMutation.isPending}
              aria-label="Delete contact"
            >
              <Trash2 className="h-3 w-3" strokeWidth={1.75} />
            </Button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="border rounded-md p-2.5 space-y-2 bg-muted/20">
          <Input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Name"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={draft.role}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, role: (v ?? "OTHER") as ApiContact["role"] }))
              }
            >
              <SelectTrigger className="h-8 text-[13px]">
                <span className="truncate">{ROLE_LABEL[draft.role]}</span>
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              type="email"
              placeholder="email (optional)"
            />
            <Input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              type="tel"
              placeholder="phone (optional)"
            />
          </div>
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setDraft({ name: "", role: "OTHER", email: "", phone: "" });
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="xs"
              disabled={!draft.name.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionEditorProps } from "./section-types";

export function ReferencesSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          References
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.references ?? []),
              { id: crypto.randomUUID(), name: "", reference: "" },
            ];
            handleUpdateContent({
              ...activeResume.content,
              references: items,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {(activeResume.content.references ?? []).map((ref, idx) => (
          <div
            key={ref.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const items = [...(activeResume.content.references ?? [])];
                items.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  references: items,
                });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove
            </button>
            <div className="space-y-1.5 pt-2">
              <Label className="text-[11px]">Name & Role</Label>
              <Input
                className="h-7 text-xs"
                placeholder="Jane Smith, CTO at Acme"
                value={ref.name}
                onChange={(e) => {
                  const items = [...(activeResume.content.references ?? [])];
                  items[idx] = { ...items[idx], name: e.target.value };
                  handleUpdateContent({
                    ...activeResume.content,
                    references: items,
                  });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Reference</Label>
              <Textarea
                className="text-xs"
                rows={3}
                placeholder="What they said about you, or their contact details."
                value={ref.reference}
                onChange={(e) => {
                  const items = [...(activeResume.content.references ?? [])];
                  items[idx] = {
                    ...items[idx],
                    reference: e.target.value,
                  };
                  handleUpdateContent({
                    ...activeResume.content,
                    references: items,
                  });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

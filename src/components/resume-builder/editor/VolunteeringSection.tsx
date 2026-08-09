"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SectionEditorProps } from "./section-types";
import { VolunteeringItem } from "./VolunteeringItem";

export function VolunteeringSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Volunteering
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.volunteer ?? []),
              {
                id: crypto.randomUUID(),
                organization: "",
                position: "",
                startDate: "",
                endDate: "",
                summary: "",
              },
            ];
            handleUpdateContent({
              ...activeResume.content,
              volunteer: items,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {(activeResume.content.volunteer ?? []).map((v, idx) => (
          <VolunteeringItem
            key={v.id}
            v={v}
            idx={idx}
            content={activeResume.content}
            handleUpdateContent={handleUpdateContent}
          />
        ))}
      </div>
    </section>
  );
}

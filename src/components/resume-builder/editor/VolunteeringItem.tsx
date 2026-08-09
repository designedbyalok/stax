"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "@/lib/types/resume";

interface VolunteeringItemProps {
  v: {
    id: string;
    organization: string;
    position: string;
    startDate: string;
    endDate: string;
    summary: string;
  };
  idx: number;
  content: ResumeData;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function VolunteeringItem({
  v,
  idx,
  content,
  handleUpdateContent,
}: VolunteeringItemProps) {
  const update = (patch: Partial<typeof v>) => {
    const items = [...(content.volunteer ?? [])];
    items[idx] = { ...items[idx], ...patch };
    handleUpdateContent({ ...content, volunteer: items });
  };

  return (
    <div className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group">
      <button
        onClick={() => {
          const items = [...(content.volunteer ?? [])];
          items.splice(idx, 1);
          handleUpdateContent({ ...content, volunteer: items });
        }}
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
      >
        Remove
      </button>
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Organization</Label>
          <Input
            className="h-7 text-xs"
            value={v.organization}
            onChange={(e) => update({ organization: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">Role</Label>
          <Input
            className="h-7 text-xs"
            value={v.position}
            onChange={(e) => update({ position: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[11px]">Start Date</Label>
          <Input
            className="h-7 text-xs"
            placeholder="Jan 2022"
            value={v.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px]">End Date</Label>
          <Input
            className="h-7 text-xs"
            placeholder="Present"
            value={v.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-[11px]">Description</Label>
        <Textarea
          className="text-xs"
          rows={2}
          value={v.summary}
          onChange={(e) => update({ summary: e.target.value })}
        />
      </div>
    </div>
  );
}

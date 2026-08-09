"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiResume, ResumeData } from "@/lib/types/resume";

interface WorkSectionProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function WorkSection({
  activeResume,
  handleUpdateContent,
}: WorkSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Work Experience
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const newWork = [
              ...activeResume.content.work,
              {
                id: crypto.randomUUID(),
                company: "",
                position: "",
                startDate: "",
                endDate: "",
                summary: "",
              },
            ];
            handleUpdateContent({ ...activeResume.content, work: newWork });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {activeResume.content.work.map((work, idx) => (
          <div
            key={work.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const newWork = [...activeResume.content.work];
                newWork.splice(idx, 1);
                handleUpdateContent({ ...activeResume.content, work: newWork });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Company</Label>
                <Input
                  className="h-7 text-xs"
                  value={work.company}
                  onChange={(e) => {
                    const newWork = [...activeResume.content.work];
                    newWork[idx].company = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      work: newWork,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">Position</Label>
                <Input
                  className="h-7 text-xs"
                  value={work.position}
                  onChange={(e) => {
                    const newWork = [...activeResume.content.work];
                    newWork[idx].position = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      work: newWork,
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Start Date</Label>
                <Input
                  className="h-7 text-xs"
                  value={work.startDate}
                  placeholder="Jan 2020"
                  onChange={(e) => {
                    const newWork = [...activeResume.content.work];
                    newWork[idx].startDate = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      work: newWork,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">End Date</Label>
                <Input
                  className="h-7 text-xs"
                  value={work.endDate}
                  placeholder="Present"
                  onChange={(e) => {
                    const newWork = [...activeResume.content.work];
                    newWork[idx].endDate = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      work: newWork,
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Description</Label>
              <Textarea
                className="text-xs"
                rows={3}
                value={work.summary}
                onChange={(e) => {
                  const newWork = [...activeResume.content.work];
                  newWork[idx].summary = e.target.value;
                  handleUpdateContent({
                    ...activeResume.content,
                    work: newWork,
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

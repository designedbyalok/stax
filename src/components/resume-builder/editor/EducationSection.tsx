"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiResume, ResumeData } from "@/lib/types/resume";

interface EducationSectionProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function EducationSection({
  activeResume,
  handleUpdateContent,
}: EducationSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Education
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const newEd = [
              ...activeResume.content.education,
              {
                id: crypto.randomUUID(),
                institution: "",
                studyType: "",
                area: "",
                startDate: "",
                endDate: "",
              },
            ];
            handleUpdateContent({ ...activeResume.content, education: newEd });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {activeResume.content.education.map((ed, idx) => (
          <div
            key={ed.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const newEd = [...activeResume.content.education];
                newEd.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  education: newEd,
                });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Institution</Label>
                <Input
                  className="h-7 text-xs"
                  value={ed.institution}
                  onChange={(e) => {
                    const newEd = [...activeResume.content.education];
                    newEd[idx].institution = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      education: newEd,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">Degree/Study Type</Label>
                <Input
                  className="h-7 text-xs"
                  value={ed.studyType}
                  onChange={(e) => {
                    const newEd = [...activeResume.content.education];
                    newEd[idx].studyType = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      education: newEd,
                    });
                  }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px]">Area of Study</Label>
              <Input
                className="h-7 text-xs"
                value={ed.area}
                onChange={(e) => {
                  const newEd = [...activeResume.content.education];
                  newEd[idx].area = e.target.value;
                  handleUpdateContent({
                    ...activeResume.content,
                    education: newEd,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Start Date</Label>
                <Input
                  className="h-7 text-xs"
                  value={ed.startDate}
                  placeholder="Aug 2018"
                  onChange={(e) => {
                    const newEd = [...activeResume.content.education];
                    newEd[idx].startDate = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      education: newEd,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">End Date</Label>
                <Input
                  className="h-7 text-xs"
                  value={ed.endDate}
                  placeholder="May 2022"
                  onChange={(e) => {
                    const newEd = [...activeResume.content.education];
                    newEd[idx].endDate = e.target.value;
                    handleUpdateContent({
                      ...activeResume.content,
                      education: newEd,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

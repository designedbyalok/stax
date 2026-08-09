"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiResume, ResumeData } from "@/lib/types/resume";

interface SkillsSectionProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function SkillsSection({
  activeResume,
  handleUpdateContent,
}: SkillsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Skills
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const newSkills = [
              ...(activeResume.content.skills || []),
              { id: crypto.randomUUID(), name: "", level: "" },
            ];
            handleUpdateContent({
              ...activeResume.content,
              skills: newSkills,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {(activeResume.content.skills || []).map((skill, idx) => (
          <div key={skill.id} className="flex items-center gap-2 relative group">
            <Input
              className="h-8 text-xs flex-1"
              placeholder="E.g., JavaScript"
              value={skill.name}
              onChange={(e) => {
                const newSkills = [...activeResume.content.skills];
                newSkills[idx].name = e.target.value;
                handleUpdateContent({
                  ...activeResume.content,
                  skills: newSkills,
                });
              }}
            />
            <button
              onClick={() => {
                const newSkills = [...activeResume.content.skills];
                newSkills.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  skills: newSkills,
                });
              }}
              className="text-muted-foreground hover:text-destructive text-xs px-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

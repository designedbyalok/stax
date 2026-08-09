"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiResume, ResumeData } from "@/lib/types/resume";

interface PersonalInfoSectionProps {
  activeResume: ApiResume;
  handleUpdateContent: (newContent: ResumeData) => void;
}

export function PersonalInfoSection({
  activeResume,
  handleUpdateContent,
}: PersonalInfoSectionProps) {
  return (
    <section className="space-y-4 mt-6">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Personal Info
      </h3>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Full Name</Label>
          <Input
            value={activeResume.content.basics.name}
            onChange={(e) =>
              handleUpdateContent({
                ...activeResume.content,
                basics: {
                  ...activeResume.content.basics,
                  name: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              value={activeResume.content.basics.email}
              onChange={(e) =>
                handleUpdateContent({
                  ...activeResume.content,
                  basics: {
                    ...activeResume.content.basics,
                    email: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone</Label>
            <Input
              value={activeResume.content.basics.phone}
              onChange={(e) =>
                handleUpdateContent({
                  ...activeResume.content,
                  basics: {
                    ...activeResume.content.basics,
                    phone: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Location</Label>
          <Input
            value={activeResume.content.basics.location}
            onChange={(e) =>
              handleUpdateContent({
                ...activeResume.content,
                basics: {
                  ...activeResume.content.basics,
                  location: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Headline</Label>
          <Input
            value={activeResume.content.basics.headline}
            onChange={(e) =>
              handleUpdateContent({
                ...activeResume.content,
                basics: {
                  ...activeResume.content.basics,
                  headline: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Professional Summary</Label>
          <Textarea
            rows={4}
            value={activeResume.content.basics.summary}
            onChange={(e) =>
              handleUpdateContent({
                ...activeResume.content,
                basics: {
                  ...activeResume.content.basics,
                  summary: e.target.value,
                },
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Website</Label>
          <Input
            placeholder="yoursite.com"
            value={activeResume.content.basics.url ?? ""}
            onChange={(e) =>
              handleUpdateContent({
                ...activeResume.content,
                basics: {
                  ...activeResume.content.basics,
                  url: e.target.value,
                },
              })
            }
          />
        </div>
      </div>
    </section>
  );
}

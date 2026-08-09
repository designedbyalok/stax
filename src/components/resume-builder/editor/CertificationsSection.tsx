"use client";

import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionEditorProps } from "./section-types";

export function CertificationsSection({
  activeResume,
  handleUpdateContent,
}: SectionEditorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Certifications
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => {
            const items = [
              ...(activeResume.content.certifications ?? []),
              {
                id: crypto.randomUUID(),
                name: "",
                issuer: "",
                date: "",
              },
            ];
            handleUpdateContent({
              ...activeResume.content,
              certifications: items,
            });
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-4">
        {(activeResume.content.certifications ?? []).map((cert, idx) => (
          <div
            key={cert.id}
            className="p-3 border rounded-lg space-y-3 bg-muted/20 relative group"
          >
            <button
              onClick={() => {
                const items = [...(activeResume.content.certifications ?? [])];
                items.splice(idx, 1);
                handleUpdateContent({
                  ...activeResume.content,
                  certifications: items,
                });
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-xs"
            >
              Remove
            </button>
            <div className="space-y-1.5 pt-2">
              <Label className="text-[11px]">Name</Label>
              <Input
                className="h-7 text-xs"
                value={cert.name}
                onChange={(e) => {
                  const items = [
                    ...(activeResume.content.certifications ?? []),
                  ];
                  items[idx] = { ...items[idx], name: e.target.value };
                  handleUpdateContent({
                    ...activeResume.content,
                    certifications: items,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px]">Issuer</Label>
                <Input
                  className="h-7 text-xs"
                  value={cert.issuer}
                  onChange={(e) => {
                    const items = [
                      ...(activeResume.content.certifications ?? []),
                    ];
                    items[idx] = { ...items[idx], issuer: e.target.value };
                    handleUpdateContent({
                      ...activeResume.content,
                      certifications: items,
                    });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">Date</Label>
                <Input
                  className="h-7 text-xs"
                  placeholder="2024"
                  value={cert.date}
                  onChange={(e) => {
                    const items = [
                      ...(activeResume.content.certifications ?? []),
                    ];
                    items[idx] = { ...items[idx], date: e.target.value };
                    handleUpdateContent({
                      ...activeResume.content,
                      certifications: items,
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

"use client";

import { ApiApplication, ApiApplicationDetail } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function TailorTab({
  card,
  detail,
}: {
  card: ApiApplication;
  detail: ApiApplicationDetail | null | undefined;
}) {
  const resume = detail?.resume;

  if (!resume) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">No Resume Attached</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Attach a resume to this application first in the Documents tab, then return here to run the AI Tailor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
      <div className="rounded-lg border bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Resume Tailor
            </h3>
            <p className="text-sm text-muted-foreground">
              Analyze your resume against the {card.companyName} job description and get tailored bullet points.
            </p>
          </div>
          {card.matchScore != null && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground mb-1">Current Match</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                {card.matchScore}% Good
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button 
            className="w-full gap-2"
            onClick={() => {
              toast.info("Generating suggestions... (This will be connected to the AI backend shortly)");
            }}
          >
            <Sparkles className="w-4 h-4" />
            Generate Suggestions
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground px-1">Job Context Analyzed</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Missing Keywords</div>
            <div className="flex flex-wrap gap-1.5">
              {card.keywords?.slice(0, 5).map((k, i) => (
                <span key={i} className="px-2 py-0.5 bg-background border text-[11px] rounded-sm text-muted-foreground">{k}</span>
              ))}
              {(!card.keywords || card.keywords.length === 0) && (
                <span className="text-xs text-muted-foreground italic">None extracted yet</span>
              )}
            </div>
          </div>
          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Matched Skills</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 bg-green-100 border-green-200 text-green-700 text-[11px] rounded-sm font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Sample Skill
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Mail, ChevronDown, ChevronRight, CornerUpLeft } from "lucide-react";
import { ApiEmailEvent } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

const INTENT_COLORS: Record<string, string> = {
  INTERVIEW_INVITE: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  REJECTION: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  OFFER: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  OUTREACH: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  GENERIC: "bg-muted text-muted-foreground",
};

const INTENT_LABELS: Record<string, string> = {
  INTERVIEW_INVITE: "Interview Invite",
  REJECTION: "Rejection",
  OFFER: "Offer",
  OUTREACH: "Outreach",
  GENERIC: "Email",
};

export function EmailEventEntry({ email }: { email: ApiEmailEvent }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative group">
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border group-last:bottom-auto group-last:h-full" />
      
      <div className="relative flex items-start gap-3 mb-4">
        <div className="w-5 h-5 rounded-full bg-background border flex items-center justify-center shrink-0 mt-0.5 z-10">
          <Mail className="h-2.5 w-2.5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0 bg-card border rounded-md overflow-hidden transition-colors hover:border-border/80">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold truncate">
                  {email.senderName || email.senderEmail.split('@')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                  &lt;{email.senderEmail}&gt;
                </span>
                <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0 h-4 rounded-sm ml-auto shrink-0 ${INTENT_COLORS[email.intent]}`}>
                  {INTENT_LABELS[email.intent]}
                </Badge>
              </div>
              <div className="text-sm font-medium leading-snug">
                {email.subject}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                <span>{format(new Date(email.date), "MMM d, h:mm a")}</span>
                {email.autoAttached && (
                  <>
                    <span>•</span>
                    <span className="text-primary/70">Auto-matched</span>
                  </>
                )}
              </div>
            </div>
            <div className="shrink-0 mt-1">
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {expanded && (
            <div className="border-t bg-background">
              {email.bodyHtml ? (
                <div className="p-4 overflow-auto max-h-[400px]">
                  <div 
                    className="prose prose-sm max-w-none text-sm break-words email-body-content"
                    dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                  />
                </div>
              ) : (
                <div className="p-4 overflow-auto max-h-[400px]">
                  <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground">
                    {email.bodyText || "No content."}
                  </pre>
                </div>
              )}
              <div className="p-2 border-t bg-muted/20 flex justify-end">
                <a 
                  href={`mailto:${email.senderEmail}?subject=Re: ${encodeURIComponent(email.subject)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-sm transition-colors hover:bg-muted"
                >
                  <CornerUpLeft className="h-3 w-3" />
                  Reply
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

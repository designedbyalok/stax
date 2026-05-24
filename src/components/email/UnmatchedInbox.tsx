"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Check, X, Inbox, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function UnmatchedInbox() {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["unmatchedEmails"],
    queryFn: () => api.listUnmatchedEmails().then(r => r.emails),
  });

  const { data: cardsData } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then(r => r.applications),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, applicationId }: { id: string, applicationId: string | null }) => 
      api.updateEmailEvent(id, { applicationId }),
    onMutate: ({ id }) => setProcessingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unmatchedEmails"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Email assigned");
      setProcessingId(null);
    },
    onError: () => {
      toast.error("Failed to assign email");
      setProcessingId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteEmailEvent(id),
    onMutate: (id) => setProcessingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unmatchedEmails"] });
      toast.success("Email dismissed");
      setProcessingId(null);
    },
  });

  if (isLoading) return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Inbox className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-tight">Unmatched Emails</h2>
      </div>
      <div className="border rounded-md divide-y bg-card overflow-hidden">
        <div className="p-4 flex gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-8 w-64 shrink-0" />
        </div>
      </div>
    </div>
  );
  if (!data?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Inbox className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-tight">Unmatched Emails ({data.length})</h2>
      </div>

      <div className="border rounded-md divide-y bg-card overflow-hidden stagger-list">
        {data.map((email) => (
          <div
            key={email.id}
            className="p-4 flex flex-col sm:flex-row sm:items-start gap-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold truncate">{email.senderName || email.senderEmail}</span>
                <span className="text-[10px] text-muted-foreground">{format(new Date(email.date), "MMM d, h:mm a")}</span>
                {email.intent !== "GENERIC" && (
                  <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 h-4">{email.intent}</Badge>
                )}
              </div>
              <p className="text-sm font-medium mb-1 truncate">{email.subject}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {email.bodyText?.slice(0, 150) || "No text content"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 sm:w-64">
              <Select
                disabled={processingId === email.id}
                onValueChange={(appId) =>
                  updateMutation.mutate({
                    id: email.id,
                    applicationId: (appId as string | null) ?? null,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Assign to card..." />
                </SelectTrigger>
                <SelectContent>
                  {cardsData?.map(app => (
                    <SelectItem key={app.id} value={app.id} className="text-xs">
                      {app.companyName} - {app.roleTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                disabled={processingId === email.id}
                onClick={() => deleteMutation.mutate(email.id)}
                title="Dismiss"
              >
                {processingId === email.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

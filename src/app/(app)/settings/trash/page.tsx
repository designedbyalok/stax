"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Undo2, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrashSettings() {
  const queryClient = useQueryClient();

  const trashQuery = useQuery({
    queryKey: ["applications", "trash"],
    queryFn: () => api.listTrash().then((r) => r.applications),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/applications/${id}/restore`, { method: "POST" }).then((r) => {
        if (!r.ok) throw new Error("Couldn't restore.");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "trash"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Card restored.");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Couldn't restore."),
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold">Trash</h2>
        <p className="text-xs text-muted-foreground">
          Deleted cards are kept for 30 days. After that they&apos;re permanently removed.
        </p>

        {trashQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[60px] w-full rounded-md" />
            <Skeleton className="h-[60px] w-full rounded-md" />
            <Skeleton className="h-[60px] w-full rounded-md" />
          </div>
        ) : (trashQuery.data?.length ?? 0) === 0 ? (
          <div className="rounded-md border border-dashed bg-card p-6 text-center text-xs text-muted-foreground">
            Trash is empty.
          </div>
        ) : (
          <div className="rounded-md border bg-card divide-y">
            {trashQuery.data!.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {a.roleTitle}
                  </div>
                  <div className="text-[12px] text-muted-foreground truncate">
                    {a.companyName}
                  </div>
                  {a.deletedAt && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Deleted{" "}
                      {formatDistanceToNow(new Date(a.deletedAt), { addSuffix: true })}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => restoreMutation.mutate(a.id)}
                  disabled={restoreMutation.isPending}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold">Export</h2>
        <div className="rounded-md border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3">
            Download all your applications as a CSV file.
          </p>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <a href="/api/export/csv" download>
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </a>
            }
          />
        </div>
      </section>
    </div>
  );
}

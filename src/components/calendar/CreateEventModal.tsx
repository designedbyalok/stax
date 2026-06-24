"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Loader2, Video } from "@/components/icons";
import { toast } from "sonner";
import { format, addMinutes } from "date-fns";
import { api } from "@/lib/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateEventModal({
  applicationId,
  open,
  onOpenChange,
  defaultTitle = "",
}: {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTitle?: string;
}) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [duration, setDuration] = useState(30);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createCalendarEvent(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      toast.success("Event added to Google Calendar");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create event");
    },
    onSettled: () => setSubmitting(false),
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get("title") || defaultTitle);
    const notes = String(formData.get("notes") || "");
    const addMeet = formData.get("addMeet") === "on";

    // Combine date and time
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = addMinutes(startDateTime, duration);

    createMutation.mutate({
      title,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes,
      addMeet,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Interview
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Event Title</Label>
            <Input name="title" defaultValue={defaultTitle} required placeholder="Interview with Acme Corp" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" required value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant={duration === mins ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(mins)}
                  className="h-7 text-xs"
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea name="notes" placeholder="Zoom link, interviewer details..." className="h-20 text-sm" />
          </div>

          <div className="flex items-center gap-2 border rounded-md p-3 bg-muted/50">
            <input type="checkbox" id="addMeet" name="addMeet" className="rounded border-border w-4 h-4" />
            <Label htmlFor="addMeet" className="flex items-center gap-1.5 cursor-pointer font-normal">
              <Video className="h-4 w-4 text-blue-500" />
              Add Google Meet video conferencing
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Calendar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

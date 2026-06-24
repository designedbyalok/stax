"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Plus, Video } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ApiCalendarEvent } from "@/lib/api-client";
import { CreateEventModal } from "@/components/calendar/CreateEventModal";

export function CalendarSection({
  applicationId,
  companyName,
  events,
}: {
  applicationId: string;
  companyName: string;
  events: ApiCalendarEvent[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Interviews</Label>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px]"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Schedule
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">No upcoming interviews.</p>
      ) : (
        <div className="space-y-1.5 mt-1">
          {events.map((e) => (
            <div key={e.id} className="text-[12px] p-2 rounded-md border flex items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{format(new Date(e.startTime), "MMM d, h:mm a")}</span>
                <span className="text-muted-foreground truncate max-w-[120px]">— {e.title}</span>
              </div>
              {e.meetLink && (
                <a href={e.meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:bg-blue-500/10 p-1 rounded">
                  <Video className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateEventModal
        applicationId={applicationId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultTitle={`Interview with ${companyName}`}
      />
    </div>
  );
}

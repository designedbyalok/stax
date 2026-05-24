"use client";

import { useQuery } from "@tanstack/react-query";
import { format, isPast, isToday, isTomorrow, isThisWeek } from "date-fns";
import { Calendar as CalendarIcon, Video, AlignLeft, AlertCircle } from "lucide-react";
import { api, ApiCalendarEvent } from "@/lib/api-client";
import { useSelectedCard } from "@/components/kanban/selected-card-store";
import { CardDrawer } from "@/components/card-detail/CardDrawer";
import { ConnectButton } from "./ConnectButton";
import { Skeleton } from "@/components/ui/skeleton";

export function InterviewsDashboard() {
  const select = useSelectedCard((s) => s.select);
  const selectedId = useSelectedCard((s) => s.selectedCardId);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetch("/api/user").then((r) => r.json()),
  });

  const appsQuery = useQuery({
    queryKey: ["applications"],
    queryFn: () => api.listApplications().then((r) => r.applications),
  });

  const eventsQuery = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: () => api.listCalendarEvents().then((r) => r.events),
    enabled: !!user?.googleIntegration,
  });

  const isConnected = !!user?.googleIntegration;
  const events = eventsQuery.data ?? [];

  const upcomingEvents = events.filter((e) => !isPast(new Date(e.endTime)));
  const pastEvents = events.filter((e) => isPast(new Date(e.endTime))).reverse();

  const selectedCard = appsQuery.data?.find((a) => a.id === selectedId) ?? null;

  function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow, ${format(d, "h:mm a")}`;
    if (isThisWeek(d)) return format(d, "EEEE, h:mm a");
    return format(d, "MMM d, h:mm a");
  }

  function EventCard({ event }: { event: ApiCalendarEvent }) {
    const isPastEvent = isPast(new Date(event.endTime));
    return (
      <div 
        className={`p-4 border rounded-lg bg-card transition-colors hover:border-foreground/20 cursor-pointer ${isPastEvent ? "opacity-60 grayscale-[0.5]" : ""}`}
        onClick={() => select(event.applicationId)}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-[14px]">{event.title}</h3>
            <div className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3" />
              {formatEventDate(event.startTime)} - {format(new Date(event.endTime), "h:mm a")}
            </div>
          </div>
          {event.meetLink && (
            <a 
              href={event.meetLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center rounded-md bg-blue-500/10 text-blue-500 p-2 hover:bg-blue-500/20 transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="Join Meet"
            >
              <Video className="h-4 w-4" />
            </a>
          )}
        </div>
        
        {event.notes && (
          <div className="mt-3 text-[12px] text-muted-foreground bg-muted/50 p-2 rounded flex gap-2 items-start">
            <AlignLeft className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div className="line-clamp-2">{event.notes}</div>
          </div>
        )}
        
        {event.application && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
              {event.application.companyName.charAt(0)}
            </div>
            <div className="text-[12px] font-medium truncate">
              {event.application.companyName}
            </div>
            <div className="text-[12px] text-muted-foreground truncate">
              · {event.application.roleTitle}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="px-6 h-12 border-b flex items-center justify-between gap-4 shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">Interviews</h1>
        <ConnectButton />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {!isConnected ? (
            <div className="text-center py-16 border rounded-lg bg-muted/20 border-dashed">
              <CalendarIcon className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-sm font-medium">Connect Google Calendar</h2>
              <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-md mx-auto">
                Connect your Google Calendar to schedule interviews directly from Stax and see your upcoming schedule here.
              </p>
              <ConnectButton />
            </div>
          ) : eventsQuery.isLoading ? (
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-[104px] w-full rounded-lg" />
                  <Skeleton className="h-[104px] w-full rounded-lg" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 mb-4">
                  Upcoming
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {upcomingEvents.length}
                  </span>
                </h2>
                
                {upcomingEvents.length === 0 ? (
                  <div className="text-[13px] text-muted-foreground p-4 border border-dashed rounded-lg text-center bg-muted/20">
                    No upcoming interviews scheduled.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                )}
              </div>

              {pastEvents.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2 mb-4 text-muted-foreground">
                    Past
                  </h2>
                  <div className="space-y-3">
                    {pastEvents.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CardDrawer
        card={selectedCard}
        isOpen={!!selectedCard}
        onClose={() => select(null)}
      />
    </div>
  );
}

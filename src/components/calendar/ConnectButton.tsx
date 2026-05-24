"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export function ConnectButton() {
  const queryClient = useQueryClient();
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetch("/api/user").then(r => r.json()),
  });

  const isConnected = !!user?.googleIntegration;

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect Google Calendar?")) return;
    setDisconnecting(true);
    try {
      await api.disconnectGoogleCalendar();
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Google Calendar disconnected");
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  if (isLoading) return <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />;

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          Connected as <span className="font-medium">{user.googleIntegration.email}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="gap-2"
        >
          {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      asChild
      className="gap-2"
    >
      <a href="/api/integrations/google-calendar/connect">
        <Calendar className="h-4 w-4" />
        Connect Google Calendar
      </a>
    </Button>
  );
}

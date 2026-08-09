"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, Unplug } from "@/components/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export function ConnectButton() {
  return (
    <Suspense fallback={<div className="h-9 w-32 bg-muted animate-pulse rounded-md" />}>
      <ConnectButtonContent />
    </Suspense>
  );
}

function ConnectButtonContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const r = await fetch("/api/user");
      if (!r.ok) throw new Error(`/api/user ${r.status}`);
      return r.json();
    },
  });

  // After the OAuth callback redirects back with ?success=1 / ?error=…,
  // refetch the user so the button flips to "Connected", show a toast,
  // and clean the query string so it doesn't fire again on refresh.
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (!success && !error) return;

    if (success) {
      toast.success("Google Calendar connected");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } else if (error) {
      const messages: Record<string, string> = {
        NotConfigured: "Google OAuth isn't configured — contact support.",
        NoCode: "Google didn't return an authorization code.",
        OAuthFailed: "Couldn't complete the Google connection. Try again.",
      };
      toast.error(messages[error] ?? `Connection failed (${error})`);
    }

    window.history.replaceState(null, "", "/settings/integrations");
  }, [searchParams, queryClient]);

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
      className="gap-2"
      onClick={() => {
        window.location.href = "/api/integrations/google-calendar/connect";
      }}
    >
      <Calendar className="h-4 w-4" />
      Connect Google Calendar
    </Button>
  );
}

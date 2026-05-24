import { EmailSettings } from "@/components/email/EmailSettings";
import { ConnectButton } from "@/components/calendar/ConnectButton";

export default function IntegrationsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h3 className="text-lg font-medium">Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect external services to Stax.
        </p>
      </div>

      <div className="space-y-6">
        <EmailSettings />
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <h3 className="font-semibold leading-none tracking-tight">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Connect your calendar to schedule interviews and see them on your dashboard.
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}

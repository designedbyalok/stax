"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy, Mail, ExternalLink } from "@/components/icons";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function EmailSettings() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetch("/api/user").then(r => r.json()),
  });

  const token = user?.inboundEmailToken;
  const forwardingAddress = token ? `stax+${token}@in.jobstax.com` : "";

  const copyToClipboard = () => {
    if (!forwardingAddress) return;
    navigator.clipboard.writeText(forwardingAddress);
    toast.success("Copied to clipboard");
  };

  if (isLoading) return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-[400px]" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-[90px] w-full rounded-md" />
        <Skeleton className="h-[120px] w-full rounded-md" />
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          Email Forwarding
        </CardTitle>
        <CardDescription>
          Forward job-related emails (rejections, interview invites, outreach) directly to Stax. 
          We'll automatically attach them to the correct application and update its status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {token ? (
          <div className="space-y-3">
            <label className="text-sm font-medium">Your personal forwarding address</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 block p-3 bg-muted rounded-md text-sm font-mono border">
                {forwardingAddress}
              </code>
              <Button variant="secondary" onClick={copyToClipboard} className="shrink-0 gap-2">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Tip: Save this as a contact in your email client named "Stax". Forward any recruiter email to it.
            </p>
          </div>
        ) : (
          <Alert>
            <AlertTitle>Not set up</AlertTitle>
            <AlertDescription>
              Your account doesn't have an inbound email token. Please contact support.
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border bg-card text-card-foreground shadow-sm p-4 text-sm space-y-2">
          <p className="font-semibold">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
            <li>Forward an email from a recruiter or company.</li>
            <li>Stax reads the sender domain, subject, and content.</li>
            <li>We find the matching application card and attach the email to its timeline.</li>
            <li>We detect the intent (e.g. Interview Invite) and suggest next steps.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

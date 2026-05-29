import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { detectStaleApplications } from "@/lib/inngest/functions/detect-stale";
import { sendWeeklyDigest } from "@/lib/inngest/functions/weekly-digest";
import { processInboundEmail } from "@/lib/inngest/functions/process-inbound-email";
import { schedulePrepReminders } from "@/lib/inngest/functions/schedule-prep-reminders";
import { computeAnalytics } from "@/lib/inngest/functions/compute-analytics";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    detectStaleApplications,
    sendWeeklyDigest,
    processInboundEmail,
    schedulePrepReminders,
    computeAnalytics,
  ],
});

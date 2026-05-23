import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { detectStaleApplications } from "@/lib/inngest/functions/detect-stale";
import { sendWeeklyDigest } from "@/lib/inngest/functions/weekly-digest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [detectStaleApplications, sendWeeklyDigest],
});

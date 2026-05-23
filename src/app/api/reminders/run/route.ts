import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api";
import { detectRemindersForUser } from "@/lib/reminders";

// Manual trigger for the current user. The same logic is fired daily by Inngest
// (lib/inngest/functions/detect-stale.ts) once it's set up.
export async function POST() {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;

  const { created } = await detectRemindersForUser(authResult.userId);
  return NextResponse.json({ ok: true, created });
}

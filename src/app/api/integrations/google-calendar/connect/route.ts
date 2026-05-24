import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google/calendar-auth";
import { requireUserId } from "@/lib/api";

export async function GET(req: Request) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  try {
    const url = getGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("Google Calendar connect error:", err);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=NotConfigured", req.url)
    );
  }
}

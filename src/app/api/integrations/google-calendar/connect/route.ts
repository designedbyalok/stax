import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/google/calendar-auth";
import { requireUserId } from "@/lib/api";

export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const url = getGoogleAuthUrl();
  return NextResponse.redirect(url);
}

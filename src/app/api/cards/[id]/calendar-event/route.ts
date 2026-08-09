import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/api";
import { createGoogleCalendarEvent } from "@/lib/google/create-event";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;
  
  const [{ id }, body] = await Promise.all([params, req.json()]);

  try {
    const event = await createGoogleCalendarEvent({
      userId: auth.userId,
      applicationId: id,
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      notes: body.notes,
      addMeet: body.addMeet,
    });

    return NextResponse.json({ event });
  } catch (err: any) {
    console.error("Calendar event creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create event" }, { status: 500 });
  }
}

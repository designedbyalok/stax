import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUserId } from "@/lib/api";

// Used by the client to read the current user's profile + integration state
// (e.g. ConnectButton on /settings/integrations checks for googleIntegration).
// Kept intentionally lean — no tokens, only the public-safe fields.
export async function GET() {
  const auth = await requireUserId();
  if (!auth.ok) return auth.response;

  const [user, googleIntegration] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        timezone: true,
        inboundEmailToken: true,
      },
    }),
    prisma.googleIntegration.findUnique({
      where: { userId: auth.userId },
      select: { email: true, createdAt: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ...user, googleIntegration });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserId } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { parseJobUrl } from "@/lib/parsers";
import { findDuplicate } from "@/lib/duplicate";

const schema = z.object({
  url: z.url().max(2000),
});

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if (!authResult.ok) return authResult.response;
  const userId = authResult.userId;

  const rl = checkRateLimit(`parse:${userId}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many parse requests. Slow down a sec." },
      { status: 429, headers: { "Retry-After": Math.ceil(rl.retryAfterMs / 1000).toString() } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "That doesn't look like a URL. Want to add this job manually?" },
      { status: 400 }
    );
  }

  const result = await parseJobUrl(parsed.data.url);

  let duplicate = null;
  if (result.fields.roleTitle && result.fields.companyName) {
    const dup = await findDuplicate(
      userId,
      result.fields.roleTitle,
      result.fields.companyName
    );
    if (dup) {
      duplicate = {
        id: dup.id,
        roleTitle: dup.roleTitle,
        companyName: dup.companyName,
        columnId: dup.columnId,
        createdAt: dup.createdAt.toISOString(),
      };
    }
  }

  return NextResponse.json({ ...result, duplicate });
}

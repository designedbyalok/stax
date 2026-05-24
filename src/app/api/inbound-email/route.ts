import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { verifyPostmarkSignature } from "@/lib/postmark/verify";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    
    // In production, verify signature
    if (process.env.NODE_ENV === "production" && process.env.POSTMARK_INBOUND_SECRET) {
      const signature = req.headers.get("x-postmark-signature");
      if (!verifyPostmarkSignature(rawBody, signature, process.env.POSTMARK_INBOUND_SECRET)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    await inngest.send({
      name: "email/inbound.received",
      data: { payload },
    });

    // Return 200 immediately to Postmark
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inbound email webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

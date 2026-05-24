import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { z } from "zod";
import prisma from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { FROM_EMAIL, getResend } from "@/lib/email/client";
import { PasswordReset } from "@/lib/email/templates/PasswordReset";
import {
  PASSWORD_RESET_TTL_MS,
  generateResetToken,
} from "@/lib/password-reset";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

function baseUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(request: Request) {
  // Rate-limit per IP — 5 requests per 15 minutes.
  const ipKey = `pw-reset:ip:${clientIp(request)}`;
  const ipRL = checkRateLimit(ipKey, 5, 15 * 60_000);
  if (!ipRL.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
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
    // Don't reveal validation specifics. Return generic OK to avoid email enumeration.
    return NextResponse.json({ ok: true });
  }

  const { email } = parsed.data;

  // Per-email rate-limit — 3 sends per hour.
  const emailRL = checkRateLimit(`pw-reset:email:${email}`, 3, 60 * 60_000);
  if (!emailRL.ok) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  // If the user doesn't exist, or has no password (Google-only account), silently
  // return OK so we don't leak which addresses are registered.
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const { token, tokenHash } = generateResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  // Invalidate any pending tokens for this user so the latest is the only working one.
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${baseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const resend = getResend();
  if (resend) {
    try {
      const html = await render(
        PasswordReset({
          firstName: (user.name || "").split(" ")[0] || "",
          resetUrl,
          expiresInMinutes: Math.floor(PASSWORD_RESET_TTL_MS / 60_000),
        })
      );
      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Reset your Stax password",
        html,
      });
    } catch (err) {
      // Log server-side but don't expose the failure to the client.
      console.error("[password-reset] Resend send failed:", err);
    }
  } else {
    // No Resend configured — log the URL so dev can copy it from the server log.
    console.warn("[password-reset] RESEND_API_KEY not set. Reset URL:", resetUrl);
  }

  return NextResponse.json({ ok: true });
}

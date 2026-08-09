import { inngest } from "../client";
import prisma from "@/lib/db";
import { normalizePostmarkEmail } from "@/lib/email/normalize";
import { findUserByInboundToken, extractTokenFromAddress } from "@/lib/email/identify-user";
import { matchEmailToApplication } from "@/lib/email/match";
import { classifyEmailIntent } from "@/lib/email/classify";
import { sanitizeHtml } from "@/lib/email/sanitize";

export const processInboundEmail = inngest.createFunction(
  { id: "process-inbound-email", triggers: [{ event: "email/inbound.received" }] },
  async ({ event, step }) => {
    const payload = event.data.payload;

    // 1. Normalize
    const parsed = await step.run("normalize-email", () => {
      return normalizePostmarkEmail(payload);
    });

    // 2. Identify User
    const user = await step.run("identify-user", async () => {
      const token = extractTokenFromAddress(parsed.toAddress);
      if (!token) return null;
      return findUserByInboundToken(token);
    });

    if (!user) {
      return { status: "ignored", reason: "User not found or no token in address" };
    }

    const [exists, applications] = await Promise.all([
      step.run("check-duplicate", async () => {
        const existing = await prisma.emailEvent.findUnique({
          where: { messageId: parsed.messageId },
        });
        return !!existing;
      }),
      step.run("fetch-applications", async () => {
        return prisma.application.findMany({
          where: { userId: user.id },
        });
      }),
    ]);

    if (exists) {
      return { status: "ignored", reason: "Duplicate message ID" };
    }

    const [matchResult, intent, sanitizedHtml] = await Promise.all([
      step.run("match-application", () => {
        return matchEmailToApplication(
          parsed.subject,
          parsed.bodyText || "",
          parsed.senderEmail,
          applications as any,
        );
      }),
      step.run("classify-intent", () => {
        return classifyEmailIntent(parsed.subject, parsed.bodyText || "");
      }),
      step.run("sanitize-html", () => {
        return parsed.bodyHtml ? sanitizeHtml(parsed.bodyHtml) : null;
      }),
    ]);

    // 7. Save to DB
    const result = await step.run("save-email", async () => {
      const attachedAppId = matchResult.autoAttach && matchResult.candidates.length > 0 
        ? matchResult.candidates[0].application.id 
        : null;

      const emailEvent = await prisma.emailEvent.create({
        data: {
          userId: user.id,
          applicationId: attachedAppId,
          messageId: parsed.messageId,
          senderEmail: parsed.senderEmail,
          senderName: parsed.senderName,
          subject: parsed.subject,
          bodyHtml: sanitizedHtml,
          bodyText: parsed.bodyText,
          intent,
          autoAttached: matchResult.autoAttach,
          matchConfidence: matchResult.confidence,
          date: parsed.date,
        },
      });

      if (attachedAppId) {
        await prisma.activity.create({
          data: {
            applicationId: attachedAppId,
            type: "EMAIL_RECEIVED",
            description: `Email received: ${parsed.subject}`,
            metadata: {
              senderEmail: parsed.senderEmail,
              senderName: parsed.senderName,
              emailEventId: emailEvent.id,
            },
          },
        });
      }
      // Unmatched emails surface via the EmailEvent table itself
      // (UnmatchedInbox queries EmailEvent where applicationId IS NULL).
      // Reminder.applicationId is required by the schema, so we can't
      // create a generic Reminder here.

      return emailEvent;
    });

    return { status: "processed", emailEventId: result.id, attached: !!result.applicationId };
  }
);

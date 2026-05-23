import { render } from "@react-email/render";
import prisma from "@/lib/db";
import { FROM_EMAIL, getResend } from "@/lib/email/client";
import { WeeklyDigest } from "@/lib/email/templates/WeeklyDigest";
import { inngest } from "../client";

/**
 * Hourly cron — for each user whose digest day + hour match the current time
 * in their timezone, send the digest.
 */
export const sendWeeklyDigest = inngest.createFunction(
  {
    id: "send-weekly-digest",
    retries: 2,
    triggers: [{ cron: "0 * * * *" }],
  },
  async ({ step }) => {
    const resend = getResend();
    if (!resend) return { skipped: "RESEND_API_KEY not set" };

    const now = new Date();

    const users = await step.run("list-eligible-users", async () =>
      prisma.user.findMany({
        where: { settings: { digestEnabled: true } },
        select: {
          id: true,
          email: true,
          name: true,
          timezone: true,
          settings: { select: { digestDay: true, digestHour: true } },
        },
      })
    );

    const appUrl = process.env.AUTH_URL || "https://jobstax.com";
    let sent = 0;

    for (const user of users) {
      const tz = user.timezone || "UTC";
      // Compute the user's local day-of-week + hour using Intl.
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
        hour: "numeric",
        hour12: false,
      }).formatToParts(now);
      const weekday = parts.find((p) => p.type === "weekday")?.value;
      const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "-1");

      const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
      };
      const userDay = weekday ? dayMap[weekday] : undefined;

      if (userDay !== user.settings?.digestDay) continue;
      if (hour !== user.settings?.digestHour) continue;

      const result = await step.run(`send-${user.id}`, () =>
        sendDigestForUser(user.id, user.email, user.name ?? "", appUrl)
      );
      if (result.sent) sent++;
    }

    return { sent };
  }
);

async function sendDigestForUser(
  userId: string,
  email: string,
  name: string,
  appUrl: string
) {
  const resend = getResend();
  if (!resend) return { sent: false };

  const reminders = await prisma.reminder.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "SNOOZED"] },
      application: { deletedAt: null },
    },
    include: {
      application: {
        select: {
          roleTitle: true,
          companyName: true,
          appliedAt: true,
          column: { select: { name: true } },
          nextActionDate: true,
        },
      },
    },
  });

  const followUps = reminders
    .filter((r) => r.type === "AUTO_FOLLOWUP")
    .map((r) => {
      const days = r.application.appliedAt
        ? Math.floor(
            (Date.now() - new Date(r.application.appliedAt).getTime()) /
              86_400_000
          )
        : undefined;
      return {
        roleTitle: r.application.roleTitle,
        companyName: r.application.companyName,
        daysSinceApplied: days,
      };
    });

  const upcomingInterviews = reminders
    .filter(
      (r) =>
        r.type === "NEXT_ACTION_DUE" &&
        (r.application.column.name === "Phone Screen" ||
          r.application.column.name === "Interview")
    )
    .map((r) => ({
      roleTitle: r.application.roleTitle,
      companyName: r.application.companyName,
      interviewDate: r.application.nextActionDate
        ? new Date(r.application.nextActionDate).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : undefined,
    }));

  if (followUps.length === 0 && upcomingInterviews.length === 0) {
    return { sent: false, reason: "nothing to send" };
  }

  const firstName = name.split(" ")[0] || "";
  const html = await render(
    WeeklyDigest({
      firstName,
      followUps,
      upcomingInterviews,
      appUrl,
    })
  );

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${followUps.length + upcomingInterviews.length} thing${
      followUps.length + upcomingInterviews.length > 1 ? "s" : ""
    } need your attention this week`,
    html,
  });

  return { sent: true };
}

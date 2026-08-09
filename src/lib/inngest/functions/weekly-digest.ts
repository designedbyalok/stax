import { render } from "@react-email/render";
import prisma from "@/lib/db";
import { FROM_EMAIL, getResend } from "@/lib/email/client";
import { WeeklyDigest } from "@/lib/email/templates/WeeklyDigest";
import { inngest } from "../client";

const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

function getLocalDayAndHour(now: Date, tz: string): { day: number | undefined; hour: number } {
  let formatter = dateTimeFormatters.get(tz);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    });
    dateTimeFormatters.set(tz, formatter);
  }
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "-1");
  return { day: weekday ? DAY_MAP[weekday] : undefined, hour };
}

const interviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

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

    const eligible = users.filter((user) => {
      const tz = user.timezone || "UTC";
      const { day: userDay, hour } = getLocalDayAndHour(now, tz);
      return userDay === user.settings?.digestDay && hour === user.settings?.digestHour;
    });

    const sent = await step.run("send-digests", async () => {
      const results = await Promise.all(
        eligible.map((user) =>
          sendDigestForUser(user.id, user.email, user.name ?? "", appUrl),
        ),
      );
      return results.filter((r) => r.sent).length;
    });

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

  const followUps: {
    roleTitle: string;
    companyName: string;
    daysSinceApplied: number | undefined;
  }[] = [];
  const upcomingInterviews: {
    roleTitle: string;
    companyName: string;
    interviewDate: string | undefined;
  }[] = [];

  for (const r of reminders) {
    if (r.type === "AUTO_FOLLOWUP") {
      const days = r.application.appliedAt
        ? Math.floor(
            (Date.now() - new Date(r.application.appliedAt).getTime()) /
              86_400_000
          )
        : undefined;
      followUps.push({
        roleTitle: r.application.roleTitle,
        companyName: r.application.companyName,
        daysSinceApplied: days,
      });
    } else if (
      r.type === "NEXT_ACTION_DUE" &&
      (r.application.column.name === "Phone Screen" ||
        r.application.column.name === "Interview")
    ) {
      upcomingInterviews.push({
        roleTitle: r.application.roleTitle,
        companyName: r.application.companyName,
        interviewDate: r.application.nextActionDate
          ? interviewDateFormatter.format(new Date(r.application.nextActionDate))
          : undefined,
      });
    }
  }

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

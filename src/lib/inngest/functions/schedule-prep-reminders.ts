import { inngest } from "../client";
import prisma from "@/lib/db";

export const schedulePrepReminders = inngest.createFunction(
  { id: "schedule-prep-reminders", triggers: [{ cron: "0 * * * *" }] },
  async ({ step }) => {
    // Find calendar events starting between 23.5 and 24.5 hours from now
    const now = new Date();
    const windowStart = new Date(now.getTime() + 23.5 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 24.5 * 60 * 60 * 1000);

    const upcomingEvents = await step.run("fetch-upcoming-events", async () => {
      return prisma.calendarEvent.findMany({
        where: {
          startTime: {
            gte: windowStart,
            lt: windowEnd,
          },
        },
        include: { application: true },
      });
    });

    if (upcomingEvents.length === 0) {
      return { status: "no-events" };
    }

    const results = await step.run("create-reminders", async () => {
      const dayStart = new Date(new Date(now).setHours(0, 0, 0, 0));
      const dayEnd = new Date(new Date(now).setHours(23, 59, 59, 999));

      const existing = await prisma.reminder.findMany({
        where: {
          type: "INTERVIEW_PREP_DUE",
          dueAt: { gte: dayStart, lt: dayEnd },
          OR: upcomingEvents.map((event) => ({
            userId: event.userId,
            applicationId: event.applicationId,
          })),
        },
        select: { userId: true, applicationId: true },
      });

      const existingKeys = new Set(
        existing.map((r) => `${r.userId}:${r.applicationId}`)
      );

      const toCreate = upcomingEvents.filter(
        (event) => !existingKeys.has(`${event.userId}:${event.applicationId}`)
      );

      if (toCreate.length > 0) {
        await prisma.reminder.createMany({
          data: toCreate.map((event) => ({
            userId: event.userId,
            applicationId: event.applicationId,
            type: "INTERVIEW_PREP_DUE" as const,
            message: `Prep for your interview with ${event.application.companyName}`,
            dueAt: new Date(),
            status: "PENDING" as const,
          })),
        });
      }

      return { createdCount: toCreate.length };
    });

    return { status: "processed", createdReminders: results.createdCount };
  }
);

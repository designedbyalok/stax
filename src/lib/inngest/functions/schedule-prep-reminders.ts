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
      let createdCount = 0;

      for (const event of upcomingEvents) {
        // Check if reminder already exists for this event
        const existing = await prisma.reminder.findFirst({
          where: {
            userId: event.userId,
            applicationId: event.applicationId,
            type: "INTERVIEW_PREP_DUE",
            dueDate: {
              // Same day
              gte: new Date(now.setHours(0, 0, 0, 0)),
              lt: new Date(now.setHours(23, 59, 59, 999)),
            },
          },
        });

        if (!existing) {
          await prisma.reminder.create({
            data: {
              userId: event.userId,
              applicationId: event.applicationId,
              type: "INTERVIEW_PREP_DUE",
              message: `Prep for your interview with ${event.application.companyName}`,
              dueDate: new Date(), // Due immediately
              status: "PENDING",
            },
          });
          createdCount++;
        }
      }

      return { createdCount };
    });

    return { status: "processed", createdReminders: results.createdCount };
  }
);

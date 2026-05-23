import prisma from "@/lib/db";
import { detectRemindersForUser } from "@/lib/reminders";
import { inngest } from "../client";

/**
 * Runs daily at 6am UTC. Scans every user's board and creates Reminder rows
 * for stale Applied / Interview cards and overdue next-actions.
 */
export const detectStaleApplications = inngest.createFunction(
  {
    id: "detect-stale-applications",
    retries: 2,
    triggers: [{ cron: "0 6 * * *" }],
  },
  async ({ step }) => {
    const users = await step.run("list-users", async () =>
      prisma.user.findMany({ select: { id: true } })
    );

    let total = 0;
    for (const user of users) {
      const result = await step.run(`detect-${user.id}`, () =>
        detectRemindersForUser(user.id)
      );
      total += result.created;
    }

    return { usersScanned: users.length, remindersCreated: total };
  }
);

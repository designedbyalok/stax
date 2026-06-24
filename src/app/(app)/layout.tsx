import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/server-query";
import { loadProfile, loadReminders, loadUser } from "@/lib/loaders";
import { Sidebar } from "@/components/nav/Sidebar";
import { seedDefaultsForUser } from "@/lib/seed";
import { WelcomeModal } from "@/components/layout/WelcomeModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ProfileModal } from "@/components/profile/ProfileModal";
import prisma from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // The JWT may outlive the User row (DB resets, manual deletes, etc.).
  // Confirm the user actually exists before we read or write anything tied to
  // userId — otherwise every Prisma FK relation downstream (Column,
  // Application, Reminder) crashes with P2003. This single round-trip is the
  // FK-safety gate; everything after it can run concurrently.
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!userExists) {
    redirect("/login?error=session_expired");
  }

  // With the user confirmed, fan the rest out in one parallel wave instead of
  // seeding-then-prefetching serially. Seeding (skipUserCheck — we just
  // verified) creates default columns only on a first visit; the prefetches
  // warm the sidebar's React Query cache.
  const queryClient = makeServerQueryClient();
  await Promise.all([
    seedDefaultsForUser(userId, { skipUserCheck: true }),
    queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: () => loadProfile(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["reminders"],
      queryFn: () => loadReminders(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: () => loadUser(userId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] flex-col bg-background md:flex-row overflow-hidden">
        <Sidebar user={session.user} />
        {/* Linear-style floating content panel: the body sits in a rounded,
            bordered, slightly-elevated surface inset from the window edges,
            so the darker shell + sidebar read as the frame around it. */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:py-2 md:pr-2 print:p-0">
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card md:rounded-xl md:border md:border-border md:shadow-sm print:rounded-none print:border-0 print:shadow-none">
            {children}
          </div>
        </main>
        <WelcomeModal />
        <SettingsModal />
        <ProfileModal />
      </div>
    </HydrationBoundary>
  );
}

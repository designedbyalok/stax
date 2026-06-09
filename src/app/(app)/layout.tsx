import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/server-query";
import { loadProfile, loadReminders, loadUser } from "@/lib/loaders";
import { Sidebar } from "@/components/nav/Sidebar";
import { seedDefaultsForUser } from "@/lib/seed";
import { WelcomeModal } from "@/components/layout/WelcomeModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { ProfileModal } from "@/components/profile/ProfileModal";
import prisma from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // The JWT may outlive the User row (DB resets, manual deletes, etc.).
  // Confirm the user actually exists before we try to read or write
  // anything tied to userId. Otherwise every Prisma FK relation downstream
  // (Column, Application, Reminder) crashes with P2003.
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!userExists) {
    redirect("/login?error=session_expired");
  }

  await seedDefaultsForUser(session.user.id);

  const queryClient = makeServerQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: () => loadProfile(session.user.id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["reminders"],
      queryFn: () => loadReminders(session.user.id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["user"],
      queryFn: () => loadUser(session.user.id),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] flex-col md:flex-row bg-background overflow-hidden">
        <Sidebar user={session.user} />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
        <WelcomeModal />
        <SettingsModal />
        <ProfileModal />
      </div>
    </HydrationBoundary>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { seedDefaultsForUser } from "@/lib/seed";
import { WelcomeModal } from "@/components/layout/WelcomeModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Sidebar user={session.user} />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </main>
      <WelcomeModal />
      <SettingsModal />
    </div>
  );
}

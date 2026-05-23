import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { seedDefaultsForUser } from "@/lib/seed";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await seedDefaultsForUser(session.user.id);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Sidebar user={session.user} />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}

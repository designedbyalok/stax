import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/server-query";
import {
  loadApplications,
  loadColumns,
  loadReminders,
  loadUserSettings,
} from "@/lib/loaders";
import BoardPageClient from "./BoardPageClient";

// Server-prefetch the data the board needs and ship it down as a
// dehydrated React Query cache, so the first paint already has the
// columns + applications + settings + reminders. The client tree
// reads them via useQuery with the same keys (Board.tsx, StatsStrip,
// RemindersBell, etc.) and never sees a loading state on cold reload.
export default async function BoardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const queryClient = makeServerQueryClient();

  // Fire all four in parallel — same set of round trips a fresh client
  // would have made, but on the server where they overlap with rendering.
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["columns"],
      queryFn: () => loadColumns(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["applications"],
      queryFn: () => loadApplications(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["userSettings"],
      queryFn: () => loadUserSettings(userId),
    }),
    queryClient.prefetchQuery({
      queryKey: ["reminders"],
      queryFn: () => loadReminders(userId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BoardPageClient />
    </HydrationBoundary>
  );
}

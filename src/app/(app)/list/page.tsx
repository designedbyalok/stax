import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { makeServerQueryClient } from "@/lib/server-query";
import {
  loadApplications,
  loadColumns,
  loadReminders,
} from "@/lib/loaders";
import ListPageClient from "./ListPageClient";

// Mirrors /board: server-prefetch columns + applications + reminders so the
// list shows up populated on first paint. userSettings isn't needed here.
export default async function ListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const queryClient = makeServerQueryClient();

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
      queryKey: ["reminders"],
      queryFn: () => loadReminders(userId),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ListPageClient />
    </HydrationBoundary>
  );
}

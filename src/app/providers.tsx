"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  // Sensible defaults so we don't refetch the world on every mount + tab focus.
  // - 5min staleTime: nav between pages is a cache hit. User-driven changes
  //   still propagate because every mutation explicitly invalidates the
  //   query keys it touches; the only thing this kills is the "data is 31s
  //   old, refetch on the next mount" churn that made the network panel
  //   feel like a slot machine.
  // - 30min gcTime: keep cached entries alive long enough to survive a
  //   round-trip out of the app and back.
  // - Skip refetch on focus / reconnect: feels janky and isn't useful for
  //   a personal tool with a single tab.
  // - Single retry: tighter UX, errors surface fast.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60_000,
            gcTime: 30 * 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    posthog.init(key, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
    });
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <PosthogIdentifier />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

function PosthogIdentifier() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (!posthog.__loaded) return;
    if (status === "authenticated" && session?.user?.id) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    } else if (status === "unauthenticated") {
      posthog.reset();
    }
  }, [session, status]);
  return null;
}

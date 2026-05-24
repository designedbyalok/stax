import "server-only";
import { QueryClient } from "@tanstack/react-query";

// One QueryClient per request on the server. The defaults match the client
// in providers.tsx, but they barely matter — this instance only lives long
// enough to prefetch data and dehydrate.
export function makeServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
      },
    },
  });
}

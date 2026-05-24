import * as Sentry from "@sentry/nextjs";

/**
 * Server + Edge runtime Sentry init.
 * Replaces the deprecated sentry.server.config.ts / sentry.edge.config.ts files.
 *
 * Next 15 calls register() once per runtime startup.
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

// Capture errors from nested React Server Components.
export const onRequestError = Sentry.captureRequestError;

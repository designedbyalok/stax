import * as Sentry from "@sentry/nextjs";

/**
 * Client-side Sentry init. Next 15 picks this file up automatically and runs
 * it once per browser session. Replaces the deprecated sentry.client.config.ts.
 *
 * Production-only on purpose — capturing errors during `next dev` floods the
 * project with broken-mid-edit ReferenceErrors, HMR chunk errors, and Prisma
 * validation noise that drown out real prod bugs.
 */
if (
  process.env.NEXT_PUBLIC_SENTRY_DSN &&
  process.env.NODE_ENV === "production"
) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
  });
}

// Capture client-side navigation timing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

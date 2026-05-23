"use client";

import posthog from "posthog-js";

export type StaxEvent =
  | "signup"
  | "login"
  | "job_added"
  | "job_parse_success"
  | "job_parse_failed"
  | "card_moved"
  | "reminder_dismissed"
  | "reminder_snoozed"
  | "csv_exported"
  | "duplicate_detected";

export function track(event: StaxEvent, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return; // not initialized — silently no-op
  posthog.capture(event, properties);
}

export function identify(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.identify(userId, properties);
}

export function reset() {
  if (typeof window === "undefined") return;
  if (!posthog.__loaded) return;
  posthog.reset();
}

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * True when both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * are set. Routes that touch Storage should check this and surface a
 * configuration error instead of triggering a fetch that resolves nowhere.
 */
export const isSupabaseConfigured = !!url && !!key;

// We still construct a client when env vars are missing so importing this
// module doesn't throw. Calls against the stub fail predictably at the
// network layer — but we'd rather check `isSupabaseConfigured` first.
export const supabase = createClient(
  url || "https://not-configured.invalid",
  key || "not-configured"
);

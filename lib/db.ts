import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Convenience accessor for the typed browser client.
 * Returns null when the Supabase env vars are not configured.
 */
export function getDb() {
  return getSupabaseBrowserClient();
}

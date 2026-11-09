import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isServerSupabaseConfigured, serverEnv } from "@/config/server-env";
import type { Database } from "@/types/database.types";

export async function createSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  if (!isServerSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component. Session refresh is handled in proxy.ts.
        }
      },
    },
  });
}

export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  if (!serverEnv.supabaseUrl || !serverEnv.supabaseServiceRoleKey) return null;

  return createClient<Database>(
    serverEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

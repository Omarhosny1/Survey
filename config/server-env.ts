import { publicEnv } from "./env";

export const serverEnv = {
  supabaseUrl: process.env.SUPABASE_URL ?? publicEnv.supabaseUrl,
  supabaseAnonKey: process.env.SUPABASE_KEY ?? publicEnv.supabaseAnonKey,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
} as const;

export const isServerSupabaseConfigured = Boolean(
  serverEnv.supabaseUrl && serverEnv.supabaseAnonKey,
);

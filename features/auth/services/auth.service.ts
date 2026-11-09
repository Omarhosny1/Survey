import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Profile } from "@/types/domain";
import { mapProfile, type ProfileRow } from "@/lib/supabase/mappers";

type Client = SupabaseClient<Database>;

export const DEMO_EMAIL = "demo@surveyland.local";
export const DEMO_PASSWORD = "surveyland-demo";
export const DEMO_NAME = "Amara Osei";
export const DEMO_COMPANY = "Northwind Studio";
export const DEMO_ROLE = "Head of Research";

function friendlyAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "That email and password don't match an account.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with that email already exists. Try signing in instead.";
  }
  if (normalized.includes("password") && normalized.includes("least")) {
    return message;
  }
  if (normalized.includes("rate limit")) {
    return "Too many attempts. Wait a moment and try again.";
  }
  return message;
}

async function fetchProfile(client: Client, userId: string): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapProfile(data as ProfileRow);
}

async function ensureProfile(
  client: Client,
  userId: string,
  email: string,
  metadata: Record<string, unknown> = {},
): Promise<Profile> {
  const existing = await fetchProfile(client, userId);
  if (existing) return existing;

  const name =
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    email.split("@")[0] ||
    "New user";
  const company = typeof metadata.company === "string" ? metadata.company : "";
  const role = typeof metadata.role === "string" ? metadata.role : "";

  const { data, error } = await client
    .from("profiles")
    .insert({ id: userId, name, email, company, role })
    .select("*")
    .single();

  if (error) {
    // The auth trigger may have created the row between the read and the insert.
    const retry = await fetchProfile(client, userId);
    if (retry) return retry;
    throw error;
  }

  return mapProfile(data as ProfileRow);
}

export async function getSessionProfile(client: Client): Promise<Profile | null> {
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError") return null;
    throw error;
  }
  if (!data.user) return null;

  return ensureProfile(
    client,
    data.user.id,
    data.user.email ?? `${data.user.id}@local`,
    data.user.user_metadata ?? {},
  );
}

export async function signIn(client: Client, email: string, password: string): Promise<Profile> {
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) throw new Error(friendlyAuthError(error.message));
  if (!data.user) throw new Error("Sign in did not return a user.");

  return ensureProfile(
    client,
    data.user.id,
    data.user.email ?? email,
    data.user.user_metadata ?? {},
  );
}

export interface SignUpInput {
  name: string;
  company: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  profile: Profile | null;
  needsConfirmation: boolean;
}

export async function signUp(client: Client, input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await client.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        name: input.name.trim(),
        company: input.company.trim(),
        role: "Researcher",
      },
    },
  });

  if (error) throw new Error(friendlyAuthError(error.message));

  if (!data.session) {
    return { profile: null, needsConfirmation: true };
  }

  if (!data.user) throw new Error("Sign up did not return a user.");

  const profile = await ensureProfile(
    client,
    data.user.id,
    data.user.email ?? input.email,
    data.user.user_metadata ?? {},
  );

  return { profile, needsConfirmation: false };
}

export async function signOut(client: Client): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(
  client: Client,
  email: string,
  redirectTo: string,
): Promise<void> {
  const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });

  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function updatePassword(client: Client, password: string): Promise<void> {
  const { error } = await client.auth.updateUser({ password });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function updateProfile(
  client: Client,
  patch: Partial<Profile>,
): Promise<Profile> {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("You must be signed in.");

  const update: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.company !== undefined) update.company = patch.company;
  if (patch.role !== undefined) update.role = patch.role;
  if (patch.timezone !== undefined) update.timezone = patch.timezone;
  if (patch.avatar !== undefined) update.avatar = patch.avatar;
  if (patch.preferences !== undefined) {
    update.preferences = patch.preferences as never;
  }

  const { data, error } = await client
    .from("profiles")
    .update(update)
    .eq("id", userData.user.id)
    .select("*")
    .single();

  if (error) throw error;
  return mapProfile(data as ProfileRow);
}

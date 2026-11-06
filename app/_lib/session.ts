"use client";

import { useSyncExternalStore } from "react";
import { seedProfile } from "./seed";
import type { Profile, SessionState } from "./types";

const STORAGE_KEY = "surveyland.session.v1";
const STORAGE_VERSION = 1;

const initialSnapshot: SessionState = { profile: null, hydrated: false };
let state: SessionState = initialSnapshot;
let hasHydrated = false;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function persist(profile: Profile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (profile) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, profile }),
      );
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Session stays in memory if storage is unavailable.
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): SessionState {
  return state;
}

function getServerSnapshot(): SessionState {
  return initialSnapshot;
}

export function hydrateSession(): void {
  if (hasHydrated || typeof window === "undefined") return;
  hasHydrated = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { version?: number; profile?: Profile };
      if (parsed.version === STORAGE_VERSION && parsed.profile) {
        state = { profile: parsed.profile, hydrated: true };
        notify();
        return;
      }
    }
  } catch {
    // Ignore malformed session data.
  }

  state = { profile: null, hydrated: true };
  notify();
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function demoProfile(): Profile {
  return {
    ...seedProfile,
    preferences: { ...seedProfile.preferences },
  };
}

export const sessionActions = {
  signIn(profile: Profile): void {
    state = { profile, hydrated: true };
    persist(profile);
    notify();
  },
  signInDemo(): Profile {
    const profile = demoProfile();
    state = { profile, hydrated: true };
    persist(profile);
    notify();
    return profile;
  },
  signOut(): void {
    state = { profile: null, hydrated: true };
    persist(null);
    notify();
  },
  updateProfile(patch: Partial<Profile>): Profile | null {
    if (!state.profile) return null;
    const profile: Profile = {
      ...state.profile,
      ...patch,
      preferences: patch.preferences
        ? { ...state.profile.preferences, ...patch.preferences }
        : state.profile.preferences,
    };
    state = { ...state, profile };
    persist(profile);
    notify();
    return profile;
  },
};

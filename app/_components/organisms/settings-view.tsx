"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Input, Select } from "@/components/atoms/input";
import { SectionLabel, Switch } from "@/components/atoms/misc";
import { FormField } from "@/components/molecules/form-field";
import { ConfirmDialog } from "@/components/molecules/modal";
import { PageHeader } from "@/components/molecules/section-heading";
import { useToast } from "@/components/molecules/toast";
import { useSession, sessionActions } from "@/lib/session";
import { surveyActions, useSurveyStore } from "@/lib/store";
import type { Profile, ProfilePreferences } from "@/lib/types";
import {
  cn,
  downloadJson,
  formatNumber,
  isEmail,
  initials,
} from "@/lib/utils";

type SettingsTab = "profile" | "notifications" | "appearance" | "data";

interface TabDefinition {
  value: SettingsTab;
  label: string;
  icon: IconName;
  hint: string;
}

const tabs: TabDefinition[] = [
  { value: "profile", label: "Profile", icon: "user", hint: "Your identity" },
  { value: "notifications", label: "Notifications", icon: "bell", hint: "What reaches you" },
  { value: "appearance", label: "Appearance", icon: "palette", hint: "How it feels" },
  { value: "data", label: "Data & demo", icon: "shield", hint: "Storage and session" },
];

const timezones = [
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
];

interface ProfileForm {
  name: string;
  email: string;
  company: string;
  role: string;
  timezone: string;
  avatar: string | null;
}

function formFromProfile(profile: Profile): ProfileForm {
  return {
    name: profile.name,
    email: profile.email,
    company: profile.company,
    role: profile.role,
    timezone: profile.timezone,
    avatar: profile.avatar,
  };
}

const preferenceRows: Array<{
  key: Exclude<keyof ProfilePreferences, "reduceMotion">;
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    key: "newResponses",
    title: "New responses",
    description: "In-product notification when a survey receives a reply.",
    icon: "inbox",
  },
  {
    key: "weeklyDigest",
    title: "Weekly digest",
    description: "A Monday summary of response volume and completion trends.",
    icon: "calendar",
  },
  {
    key: "productUpdates",
    title: "Product updates",
    description: "Occasional notes about new SurveyLand features and templates.",
    icon: "sparkles",
  },
];

function SectionCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface shadow-soft">
      <div className="border-b border-line/80 px-5 py-4">
        <h2 className="font-display text-xl tracking-tight text-ink">{title}</h2>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-faint">{description}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/80 bg-cream/40 px-5 py-3">
          {footer}
        </div>
      )}
    </section>
  );
}

function SettingsContent({ profile }: { profile: Profile }) {
  const state = useSurveyStore();
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<SettingsTab>("profile");
  const [form, setForm] = useState<ProfileForm>(() => formFromProfile(profile));
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [resetOpen, setResetOpen] = useState(false);

  const dirty = (
    ["name", "email", "company", "role", "timezone", "avatar"] as Array<keyof ProfileForm>
  ).some((key) => form[key] !== profile[key]);

  const patchForm = (patch: Partial<ProfileForm>) => {
    setForm((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file isn’t an image", "Choose a PNG, JPG, or WebP file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("That image is too large", "Choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patchForm({ avatar: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const nextErrors: { name?: string; email?: string } = {};
    if (!form.name.trim()) nextErrors.name = "Add your name so teammates know who you are.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Check your profile details", "A name and valid email are required.");
      return;
    }

    const updated = sessionActions.updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
      timezone: form.timezone,
      avatar: form.avatar,
    });
    if (updated) {
      setForm(formFromProfile(updated));
      toast.success("Profile updated", "Your details are saved in this browser.");
    }
  };

  const updatePreference = (key: keyof ProfilePreferences, value: boolean) => {
    sessionActions.updateProfile({ preferences: { ...profile.preferences, [key]: value } });
  };

  const exportData = () => {
    downloadJson("surveyland-backup.json", {
      exportedAt: new Date().toISOString(),
      profile,
      surveys: state.surveys,
      responses: state.responses,
      activity: state.activity,
    });
    toast.success("Data exported", "A JSON backup of this demo workspace was downloaded.");
  };

  const resetDemo = () => {
    surveyActions.reset();
    setResetOpen(false);
    toast.success("Demo data restored", "Eight original surveys and 1,196 responses are back.");
  };

  const signOut = () => {
    sessionActions.signOut();
    router.replace("/login");
  };

  const tabLabel = tabs.find((item) => item.value === tab)?.label ?? "Settings";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account & workspace"
        title="Settings"
        description="Your profile, notification preferences, and the demo data stored in this browser."
      />

      <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div
            role="tablist"
            aria-label="Settings sections"
            aria-orientation="vertical"
            className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1.5 shadow-soft lg:flex-col"
          >
            {tabs.map((item) => {
              const active = item.value === tab;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.value)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left transition-colors lg:w-full",
                    active ? "bg-forest-soft/70 text-forest" : "text-ink-soft hover:bg-canvas-deep/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                      active
                        ? "border-forest/15 bg-surface text-forest"
                        : "border-transparent text-ink-faint",
                    )}
                  >
                    <Icon name={item.icon} size={13} />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-[12px] font-medium", active ? "text-forest" : "text-ink-soft")}>
                      {item.label}
                    </span>
                    <span className="hidden text-[9px] text-ink-faint lg:block">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 hidden rounded-lg border border-line/80 bg-cream/40 p-3 lg:block">
            <SectionLabel>Local demo</SectionLabel>
            <p className="mt-1.5 text-[9.5px] leading-relaxed text-ink-faint">
              Nothing leaves this browser. Use Data &amp; demo to export a backup or reset.
            </p>
          </div>
        </aside>

        <div key={tab} role="tabpanel" aria-label={tabLabel} className="min-w-0 animate-enter-fast">
          {tab === "profile" && (
            <SectionCard
              title="Profile"
              description="This is how you appear in the demo workspace. Your email is never sent anywhere."
              footer={
                <>
                  <p
                    className={cn(
                      "flex items-center gap-1.5 text-[9.5px]",
                      dirty ? "text-warning" : "text-ink-faint",
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", dirty ? "bg-gold" : "bg-forest")} />
                    {dirty ? "Unsaved profile changes" : "All changes saved"}
                  </p>
                  <Button
                    onClick={saveProfile}
                    disabled={!dirty}
                    iconLeft={<Icon name="check" size={13} />}
                  >
                    Save profile
                  </Button>
                </>
              }
            >
              <div className="flex flex-wrap items-center gap-4 border-b border-line/80 pb-5">
                <Avatar name={form.name} src={form.avatar} size="xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-ink">Profile photo</p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-faint">
                    PNG, JPG, or WebP up to 2 MB. Saved with your profile.
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInput.current?.click()}
                      iconLeft={<Icon name="upload" size={12} />}
                    >
                      Change photo
                    </Button>
                    {form.avatar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => patchForm({ avatar: null })}
                        iconLeft={<Icon name="trash" size={12} />}
                      >
                        Remove
                      </Button>
                    )}
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatar}
                      className="sr-only"
                      aria-label="Upload profile photo"
                    />
                  </div>
                </div>
                <div className="hidden rounded-lg border border-line bg-canvas/50 px-3 py-2 text-center sm:block">
                  <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">Initials</p>
                  <p className="mt-0.5 font-display text-lg text-ink">{initials(form.name) || "SL"}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormField label="Full name" htmlFor="profile-name" error={errors.name} required>
                  <Input
                    id="profile-name"
                    value={form.name}
                    onChange={(event) => patchForm({ name: event.target.value })}
                    invalid={Boolean(errors.name)}
                    autoComplete="name"
                    aria-describedby={errors.name ? "profile-name-error" : undefined}
                  />
                </FormField>
                <FormField label="Email address" htmlFor="profile-email" error={errors.email} required>
                  <Input
                    id="profile-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => patchForm({ email: event.target.value })}
                    invalid={Boolean(errors.email)}
                    autoComplete="email"
                    aria-describedby={errors.email ? "profile-email-error" : undefined}
                  />
                </FormField>
                <FormField label="Company" htmlFor="profile-company" optional>
                  <Input
                    id="profile-company"
                    value={form.company}
                    onChange={(event) => patchForm({ company: event.target.value })}
                    autoComplete="organization"
                  />
                </FormField>
                <FormField label="Role" htmlFor="profile-role" optional>
                  <Input
                    id="profile-role"
                    value={form.role}
                    onChange={(event) => patchForm({ role: event.target.value })}
                    autoComplete="organization-title"
                  />
                </FormField>
                <FormField
                  label="Timezone"
                  htmlFor="profile-timezone"
                  hint="Used for dates and digest timing in a real workspace."
                  className="sm:col-span-2"
                >
                  <Select
                    id="profile-timezone"
                    value={form.timezone}
                    onChange={(event) => patchForm({ timezone: event.target.value })}
                  >
                    {!timezones.includes(form.timezone) && (
                      <option value={form.timezone}>{form.timezone}</option>
                    )}
                    {timezones.map((timezone) => (
                      <option key={timezone} value={timezone}>
                        {timezone.replace("_", " ")}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </SectionCard>
          )}

          {tab === "notifications" && (
            <SectionCard
              title="Notifications"
              description="Choose what you would hear about in a live workspace. Preferences save automatically."
            >
              <div className="divide-y divide-line/80">
                {preferenceRows.map((row) => (
                  <div key={row.key} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-canvas/50 text-ink-faint">
                        <Icon name={row.icon} size={13} />
                      </span>
                      <div>
                        <p className="text-[12.5px] font-medium text-ink">{row.title}</p>
                        <p className="mt-0.5 max-w-md text-[10.5px] leading-relaxed text-ink-faint">
                          {row.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.preferences[row.key]}
                      onCheckedChange={(checked) => updatePreference(row.key, checked)}
                      label={row.title}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-line/80 bg-cream/40 px-3 py-2.5">
                <Icon name="info" size={12} className="mt-0.5 shrink-0 text-ink-faint" />
                <p className="text-[9.5px] leading-relaxed text-ink-faint">
                  This demo has no email service. Toggles are saved to your local profile so you can see the
                  interaction, but no messages are delivered.
                </p>
              </div>
            </SectionCard>
          )}

          {tab === "appearance" && (
            <div className="space-y-4">
              <SectionCard
                title="Appearance"
                description="Small choices that make long sessions feel calmer."
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-canvas/50 text-ink-faint">
                      <Icon name="moon" size={13} />
                    </span>
                    <div>
                      <p className="text-[12.5px] font-medium text-ink">Reduce motion</p>
                      <p className="mt-0.5 max-w-md text-[10.5px] leading-relaxed text-ink-faint">
                        Turns off page transitions, chart growth, and other decorative animation.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={profile.preferences.reduceMotion}
                    onCheckedChange={(checked) => updatePreference("reduceMotion", checked)}
                    label="Reduce motion"
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Palette"
                description="SurveyLand uses one warm, editorial palette across the workspace."
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { label: "Canvas", value: "#f6f3ec" },
                    { label: "Ink", value: "#15211c" },
                    { label: "Forest", value: "#0d5947" },
                    { label: "Coral", value: "#e4612d" },
                    { label: "Gold", value: "#c9952f" },
                    { label: "Slate", value: "#517486" },
                  ].map((color) => (
                    <div
                      key={color.label}
                      className="flex items-center gap-2 rounded-md border border-line bg-canvas/40 p-2"
                    >
                      <span
                        className="h-7 w-7 shrink-0 rounded-[6px] border border-black/5"
                        style={{ backgroundColor: color.value }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-[10.5px] font-medium text-ink">{color.label}</p>
                        <p className="font-mono text-[8.5px] uppercase text-ink-faint">{color.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {tab === "data" && (
            <div className="space-y-4">
              <SectionCard
                title="Demo data"
                description="Everything in this workspace lives in your browser's local storage."
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line bg-canvas/40 p-3">
                    <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">Surveys</p>
                    <p className="mt-1 font-display text-xl leading-none text-ink">
                      {formatNumber(state.surveys.length)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-line bg-canvas/40 p-3">
                    <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ink-faint">Responses</p>
                    <p className="mt-1 font-display text-xl leading-none text-ink">
                      {formatNumber(state.responses.length)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={exportData}
                    iconLeft={<Icon name="download" size={13} />}
                  >
                    Export JSON backup
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setResetOpen(true)}
                    iconLeft={<Icon name="refresh" size={13} />}
                  >
                    Reset demo data
                  </Button>
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-[9.5px] leading-relaxed text-ink-faint">
                  <Icon name="alert" size={11} className="mt-px shrink-0" />
                  Resetting removes surveys you created and restores the original eight demo surveys and
                  1,196 sample responses. Export a backup first if you want to keep your work.
                </p>
              </SectionCard>

              <SectionCard
                title="Session"
                description="You are signed in to the local demo profile on this device."
                footer={
                  <>
                    <p className="font-mono text-[9px] text-ink-faint">{profile.email}</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={signOut}
                      iconLeft={<Icon name="logout" size={13} />}
                    >
                      Sign out
                    </Button>
                  </>
                }
              >
                <div className="flex items-center gap-3">
                  <Avatar name={profile.name} src={profile.avatar} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">{profile.name}</p>
                    <p className="truncate text-[10.5px] text-ink-faint">
                      {profile.role || "Team member"}
                      {profile.company ? ` · ${profile.company}` : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-start gap-1.5 rounded-lg border border-line/80 bg-cream/40 px-3 py-2.5 text-[9.5px] leading-relaxed text-ink-faint">
                  <Icon name="lock" size={11} className="mt-px shrink-0" />
                  Signing out clears the local session. Your surveys stay in this browser until you reset
                  the demo data or clear site storage.
                </p>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={resetDemo}
        title="Reset all demo data?"
        description="This restores the original eight surveys and 1,196 responses. Any surveys, edits, or responses you created will be permanently removed from this browser."
        confirmLabel="Reset demo data"
      />
    </div>
  );
}

export function SettingsView() {
  const { profile } = useSession();
  if (!profile) return null;
  return <SettingsContent profile={profile} />;
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/atoms/button";
import { Icon } from "@/app/_components/atoms/icon";
import { Input } from "@/app/_components/atoms/input";
import { Spinner } from "@/app/_components/atoms/spinner";
import { AuthHeading } from "@/app/_components/molecules/auth-heading";
import { FormField } from "@/app/_components/molecules/form-field";
import { PasswordInput } from "@/app/_components/molecules/password-input";
import { useToast } from "@/app/_components/molecules/toast";
import { demoProfile, sessionActions, useSession } from "@/app/_lib/session";
import { isEmail } from "@/app/_lib/utils";

interface LoginErrors {
  email?: string;
  password?: string;
}

function profileForLogin(email: string) {
  const base = demoProfile();
  const local = email.split("@")[0] ?? "";
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return { ...base, email, name: name || base.name };
}

export default function LoginPage() {
  const { profile } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) router.replace("/dashboard");
  }, [profile, router]);

  if (profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="text-forest" />
      </div>
    );
  }

  const update = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: LoginErrors = {};
    if (!values.email.trim()) nextErrors.email = "Enter your email address.";
    else if (!isEmail(values.email.trim())) nextErrors.email = "That email address doesn't look right.";
    if (!values.password) nextErrors.password = "Enter your password.";
    else if (values.password.length < 6)
      nextErrors.password = "Passwords are at least 6 characters in this demo.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      sessionActions.signIn(profileForLogin(values.email.trim()));
      toast.success("Welcome back", "Your demo workspace is ready.");
      router.push("/dashboard");
    }, 420);
  };

  const handleDemo = () => {
    setLoading(true);
    window.setTimeout(() => {
      sessionActions.signInDemo();
      toast.info("Demo workspace ready", "Eight surveys and 1,196 responses are waiting.");
      router.push("/dashboard");
    }, 320);
  };

  return (
    <div>
      <AuthHeading
        eyebrow="Welcome back"
        title="Good to see you again."
        description="Sign in to pick up where you left off â€” or step into the demo workspace first."
      />

      <div className="rounded-xl border border-forest/15 bg-forest-soft/45 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forest/10 bg-surface text-forest">
            <Icon name="sparkles" size={15} />
          </span>
          <div>
            <p className="text-[12.5px] font-medium text-ink">Just looking around?</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
              Open a fully populated workspace. No email, no password, no waiting.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="mt-3 bg-surface"
          loading={loading}
          onClick={handleDemo}
          iconLeft={!loading ? <Icon name="play" size={13} /> : undefined}
        >
          Open the demo workspace
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-ink-faint">
          or sign in with email
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email address" htmlFor="login-email" required error={errors.email}>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            prefix={<Icon name="mail" size={14} />}
          />
        </FormField>

        <FormField label="Password" htmlFor="login-password" required error={errors.password}>
          <PasswordInput
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={values.password}
            onChange={(event) => update("password", event.target.value)}
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
          />
        </FormField>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[11.5px] font-medium text-forest underline-offset-4 transition-colors hover:text-forest-deep hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-center text-[12px] text-ink-soft">
        New to SurveyLand?{" "}
        <Link
          href="/register"
          className="font-medium text-forest underline-offset-4 transition-colors hover:text-forest-deep hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-6 flex items-start gap-2 border-t border-line/70 pt-4 text-[10px] leading-relaxed text-ink-faint">
        <Icon name="info" size={12} className="mt-0.5 shrink-0" />
        Demo authentication only. Use the shortcut above, or any valid email and a 6+ character
        password. Nothing is sent to a server.
      </p>
    </div>
  );
}

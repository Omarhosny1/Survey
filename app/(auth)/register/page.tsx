"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/_components/atoms/button";
import { Icon } from "@/app/_components/atoms/icon";
import { Input } from "@/app/_components/atoms/input";
import { Spinner } from "@/app/_components/atoms/spinner";
import { AuthHeading } from "@/app/_components/molecules/auth-heading";
import { FormField, PasswordHint } from "@/app/_components/molecules/form-field";
import { PasswordInput } from "@/app/_components/molecules/password-input";
import { useToast } from "@/app/_components/molecules/toast";
import { demoProfile, sessionActions, useSession } from "@/app/_lib/session";
import { isEmail, passwordLabel, passwordScore } from "@/app/_lib/utils";

interface RegisterErrors {
  name?: string;
  company?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const { profile } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState({ name: "", company: "", email: "", password: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
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

  const score = passwordScore(values.password);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: RegisterErrors = {};
    if (values.name.trim().length < 2) nextErrors.name = "Tell us what to call you.";
    if (values.company.trim().length < 2) nextErrors.company = "Give your workspace a name.";
    if (!values.email.trim()) nextErrors.email = "Enter your work email.";
    else if (!isEmail(values.email.trim())) nextErrors.email = "That email address doesn't look right.";
    if (values.password.length < 8) nextErrors.password = "Use at least 8 characters.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const base = demoProfile();
      sessionActions.signIn({
        ...base,
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        role: "Researcher",
      });
      toast.success("Workspace ready", `Welcome to SurveyLand, ${values.name.trim().split(" ")[0]}.`);
      router.push("/dashboard");
    }, 520);
  };

  const handleDemo = () => {
    sessionActions.signInDemo();
    toast.info("Demo workspace ready", "Eight surveys and 1,196 responses are waiting.");
    router.push("/dashboard");
  };

  return (
    <div>
      <AuthHeading
        eyebrow="Create your account"
        title="Make room for better questions."
        description="Set up a local workspace in under a minute. No credit card, no email confirmation."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Your name" htmlFor="register-name" required error={errors.name}>
            <Input
              id="register-name"
              name="name"
              autoComplete="name"
              placeholder="Amara Osei"
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
            />
          </FormField>
          <FormField label="Workspace" htmlFor="register-company" required error={errors.company}>
            <Input
              id="register-company"
              name="company"
              autoComplete="organization"
              placeholder="Northwind Studio"
              value={values.company}
              onChange={(event) => update("company", event.target.value)}
              invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? "register-company-error" : undefined}
            />
          </FormField>
        </div>

        <FormField label="Work email" htmlFor="register-email" required error={errors.email}>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            prefix={<Icon name="mail" size={14} />}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="register-password"
          required
          error={errors.password}
          hint={values.password.length === 0 ? "At least 8 characters." : undefined}
        >
          <div className="space-y-1.5">
            <PasswordInput
              id="register-password"
              name="password"
              autoComplete="new-password"
              placeholder="Choose a password"
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "register-password-error" : undefined}
            />
            {values.password.length > 0 && !errors.password && (
              <PasswordHint score={score} label={passwordLabel(score)} />
            )}
          </div>
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
          Create my workspace
        </Button>
      </form>

      <p className="mt-5 text-center text-[12px] text-ink-soft">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-forest underline-offset-4 transition-colors hover:text-forest-deep hover:underline"
        >
          Sign in
        </Link>
      </p>

      <button
        type="button"
        onClick={handleDemo}
        className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-faint transition-colors hover:text-forest"
      >
        <Icon name="play" size={11} />
        Or explore the demo without an account
      </button>

      <p className="mt-6 flex items-start gap-2 border-t border-line/70 pt-4 text-[10px] leading-relaxed text-ink-faint">
        <Icon name="info" size={12} className="mt-0.5 shrink-0" />
        This creates a local demo profile in your browser. It is not a real account, and no
        email is sent or stored on a server.
      </p>
    </div>
  );
}

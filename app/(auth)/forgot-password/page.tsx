"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/app/_components/atoms/button";
import { Icon } from "@/app/_components/atoms/icon";
import { Input } from "@/app/_components/atoms/input";
import { AuthHeading } from "@/app/_components/molecules/auth-heading";
import { FormField } from "@/app/_components/molecules/form-field";
import { isEmail } from "@/app/_lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter the email you signed up with.");
      return;
    }
    if (!isEmail(email.trim())) {
      setError("That email address doesn't look right.");
      return;
    }
    setError(undefined);
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 500);
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-forest/15 bg-forest-soft text-forest animate-pop">
          <Icon name="mail" size={24} />
        </span>
        <h1 className="mt-5 font-display text-[32px] leading-[1.08] tracking-[-0.035em] text-ink">
          Check your inbox.
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-[13px] leading-relaxed text-ink-soft">
          If this were a live deployment, a reset link would be on its way to{" "}
          <span className="font-medium text-ink">{email.trim()}</span>.
        </p>
        <div className="mt-5 rounded-lg border border-line bg-cream/60 px-4 py-3 text-left">
          <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-faint">
            <Icon name="info" size={12} className="mt-0.5 shrink-0" />
            No email has actually been sent. This is a front-end demo with local data, so there is
            no mail service connected.
          </p>
        </div>
        <div className="mt-6 space-y-2">
          <Button href="/reset-password" size="lg" fullWidth>
            Continue to reset form
          </Button>
          <Button href="/login" variant="ghost" size="sm" fullWidth>
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading
        eyebrow="Password help"
        title="Lost the key?"
        description="Enter the email you use for SurveyLand and we'll point you toward a reset."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Email address" htmlFor="forgot-email" required error={error}>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@company.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError(undefined);
            }}
            invalid={Boolean(error)}
            aria-describedby={error ? "forgot-email-error" : undefined}
            prefix={<Icon name="mail" size={14} />}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
          Send reset instructions
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-1 text-[12px] text-ink-soft">
        <Icon name="arrowLeft" size={12} />
        <Link
          href="/login"
          className="font-medium text-forest underline-offset-4 transition-colors hover:text-forest-deep hover:underline"
        >
          Back to sign in
        </Link>
      </div>

      <p className="mt-6 flex items-start gap-2 border-t border-line/70 pt-4 text-[10px] leading-relaxed text-ink-faint">
        <Icon name="info" size={12} className="mt-0.5 shrink-0" />
        Demo only â€” no email is sent. You can continue to the reset form to preview the flow.
      </p>
    </div>
  );
}

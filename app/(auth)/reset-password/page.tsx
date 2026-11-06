"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/app/_components/atoms/button";
import { Icon } from "@/app/_components/atoms/icon";
import { AuthHeading } from "@/app/_components/molecules/auth-heading";
import { FormField, PasswordHint } from "@/app/_components/molecules/form-field";
import { PasswordInput } from "@/app/_components/molecules/password-input";
import { passwordLabel, passwordScore } from "@/app/_lib/utils";

export default function ResetPasswordPage() {
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const score = passwordScore(values.password);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { password?: string; confirm?: string } = {};
    if (values.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (values.confirm !== values.password) nextErrors.confirm = "The passwords don't match.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 600);
  };

  if (done) {
    return (
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-success/15 bg-success-soft text-success animate-pop">
          <Icon name="checkCircle" size={25} />
        </span>
        <h1 className="mt-5 font-display text-[32px] leading-[1.08] tracking-[-0.035em] text-ink">
          Password updated.
        </h1>
        <p className="mx-auto mt-3 max-w-[330px] text-[13px] leading-relaxed text-ink-soft">
          In a live product you would now be signed in with the new password. Here, any password
          already works â€” so you can head straight back.
        </p>
        <div className="mt-6 space-y-2">
          <Button href="/login" size="lg" fullWidth iconRight={<Icon name="arrowRight" size={15} />}>
            Go to sign in
          </Button>
          <Button href="/dashboard" variant="ghost" size="sm" fullWidth>
            Open the demo workspace
          </Button>
        </div>
        <p className="mt-5 text-[10px] text-ink-faint">
          Demo preview â€” no password was stored or changed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <AuthHeading
        eyebrow="Choose a new password"
        title="A fresh start."
        description="Make it something you'll remember. At least eight characters is a good place to begin."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="New password" htmlFor="reset-password" required error={errors.password}>
          <div className="space-y-1.5">
            <PasswordInput
              id="reset-password"
              name="new-password"
              autoComplete="new-password"
              autoFocus
              placeholder="At least 8 characters"
              value={values.password}
              onChange={(event) => {
                setValues((current) => ({ ...current, password: event.target.value }));
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "reset-password-error" : undefined}
            />
            {values.password.length > 0 && !errors.password && (
              <PasswordHint score={score} label={passwordLabel(score)} />
            )}
          </div>
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="reset-confirm"
          required
          error={errors.confirm}
        >
          <PasswordInput
            id="reset-confirm"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Type it once more"
            value={values.confirm}
            onChange={(event) => {
              setValues((current) => ({ ...current, confirm: event.target.value }));
              setErrors((current) => ({ ...current, confirm: undefined }));
            }}
            invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? "reset-confirm-error" : undefined}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading}>
          Update password
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
        This is a visual preview. No reset token is validated and no password is stored in this
        demo.
      </p>
    </div>
  );
}

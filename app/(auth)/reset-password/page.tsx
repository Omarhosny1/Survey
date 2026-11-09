"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { useToast } from "@/components/molecules/toast";
import { AuthHeading } from "@/components/molecules/auth-heading";
import { FormField, PasswordHint } from "@/components/molecules/form-field";
import { PasswordInput } from "@/components/molecules/password-input";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas/auth.schema";
import { sessionActions } from "@/features/auth/store";
import { passwordLabel, passwordScore } from "@/lib/utils";

export default function ResetPasswordPage() {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const password = useWatch({ control, name: "password" });
  const score = passwordScore(password ?? "");

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      await sessionActions.updatePassword(values.password);
      setDone(true);
    } catch (error) {
      toast.error(
        "Could not update your password",
        error instanceof Error
          ? error.message
          : "Open the reset link from your email and try again.",
      );
    }
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
          Your Supabase account password has been changed. Sign in with the new password to continue
          where you left off.
        </p>
        <div className="mt-6 space-y-2">
          <Button href="/login" size="lg" fullWidth iconRight={<Icon name="arrowRight" size={15} />}>
            Go to sign in
          </Button>
        </div>
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="New password"
          htmlFor="reset-password"
          required
          error={errors.password?.message}
        >
          <div className="space-y-1.5">
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              autoFocus
              placeholder="At least 8 characters"
              invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "reset-password-error" : undefined}
              {...register("password")}
            />
            {password.length > 0 && !errors.password && (
              <PasswordHint score={score} label={passwordLabel(score)} />
            )}
          </div>
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="reset-confirm"
          required
          error={errors.confirm?.message}
        >
          <PasswordInput
            id="reset-confirm"
            autoComplete="new-password"
            placeholder="Type it once more"
            invalid={Boolean(errors.confirm)}
            aria-describedby={errors.confirm ? "reset-confirm-error" : undefined}
            {...register("confirm")}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} disabled={isSubmitting}>
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
        Open this page from the reset link in your email so Supabase can verify the recovery session.
      </p>
    </div>
  );
}

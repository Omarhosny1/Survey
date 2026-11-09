"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { AuthHeading } from "@/components/molecules/auth-heading";
import { FormField } from "@/components/molecules/form-field";
import { useToast } from "@/components/molecules/toast";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schemas/auth.schema";
import { sessionActions } from "@/features/auth/store";

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await sessionActions.requestPasswordReset(
        values.email,
        `${window.location.origin}/reset-password`,
      );
      setSubmittedEmail(values.email);
      setSent(true);
    } catch (error) {
      toast.error(
        "Could not send the reset email",
        error instanceof Error ? error.message : "Check your connection and try again.",
      );
    }
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
          If an account exists for{" "}
          <span className="font-medium text-ink">{submittedEmail}</span>, a password reset link is on
          its way. Open it to choose a new password.
        </p>
        <div className="mt-5 rounded-lg border border-line bg-cream/60 px-4 py-3 text-left">
          <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-faint">
            <Icon name="info" size={12} className="mt-0.5 shrink-0" />
            Supabase sends this email. In local development you can read it in the Supabase mail
            catcher instead of a real inbox.
          </p>
        </div>
        <div className="mt-6 space-y-2">
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Email address"
          htmlFor="forgot-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@company.com"
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            prefix={<Icon name="mail" size={14} />}
            {...register("email")}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} disabled={isSubmitting}>
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
        We will only send a reset email if the address belongs to an existing account.
      </p>
    </div>
  );
}

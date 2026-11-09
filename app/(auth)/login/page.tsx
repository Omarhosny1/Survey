"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { Spinner } from "@/components/atoms/spinner";
import { AuthHeading } from "@/components/molecules/auth-heading";
import { FormField } from "@/components/molecules/form-field";
import { PasswordInput } from "@/components/molecules/password-input";
import { useToast } from "@/components/molecules/toast";
import { loginSchema, type LoginValues } from "@/features/auth/schemas/auth.schema";
import { sessionActions, useSession } from "@/features/auth/store";

export default function LoginPage() {
  const { profile } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [demoLoading, setDemoLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

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

  const onSubmit = async (values: LoginValues) => {
    try {
      await sessionActions.signIn(values.email, values.password);
      toast.success("Welcome back", "Your workspace is ready.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        "Could not sign in",
        error instanceof Error ? error.message : "Check your details and try again.",
      );
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await sessionActions.signInDemo();
      toast.info("Demo workspace ready", "Eight surveys and sample responses are waiting.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        "Could not open the demo",
        error instanceof Error ? error.message : "Check your connection and try again.",
      );
    } finally {
      setDemoLoading(false);
    }
  };

  const loading = isSubmitting || demoLoading;

  return (
    <div>
      <AuthHeading
        eyebrow="Welcome back"
        title="Good to see you again."
        description="Sign in to pick up where you left off — or step into the demo workspace first."
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
          loading={demoLoading}
          onClick={handleDemo}
          iconLeft={!demoLoading ? <Icon name="play" size={13} /> : undefined}
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Email address"
          htmlFor="login-email"
          required
          error={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            prefix={<Icon name="mail" size={14} />}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="login-password"
          required
          error={errors.password?.message}
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="Your password"
            invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            {...register("password")}
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
        Authentication is handled by Supabase. Your session is stored in secure cookies and stays on
        this device.
      </p>
    </div>
  );
}

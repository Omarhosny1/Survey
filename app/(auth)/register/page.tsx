"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/atoms/button";
import { Icon } from "@/components/atoms/icon";
import { Input } from "@/components/atoms/input";
import { Spinner } from "@/components/atoms/spinner";
import { AuthHeading } from "@/components/molecules/auth-heading";
import { FormField, PasswordHint } from "@/components/molecules/form-field";
import { PasswordInput } from "@/components/molecules/password-input";
import { useToast } from "@/components/molecules/toast";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas/auth.schema";
import { sessionActions, useSession } from "@/features/auth/store";
import { passwordLabel, passwordScore } from "@/lib/utils";

export default function RegisterPage() {
  const { profile } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [demoLoading, setDemoLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", company: "", email: "", password: "" },
  });

  const password = useWatch({ control, name: "password" });
  const score = passwordScore(password ?? "");

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

  const onSubmit = async (values: RegisterValues) => {
    try {
      const result = await sessionActions.signUp({
        name: values.name,
        company: values.company,
        email: values.email,
        password: values.password,
      });

      if (result.needsConfirmation) {
        toast.success(
          "Confirm your email",
          "Check your inbox for a confirmation link, then sign in.",
        );
        router.push("/login");
        return;
      }

      toast.success("Workspace ready", `Welcome to SurveyLand, ${values.name.split(" ")[0]}.`);
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        "Could not create your account",
        error instanceof Error ? error.message : "Check your details and try again.",
      );
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      await sessionActions.signInDemo();
      toast.info("Demo workspace ready", "Sample surveys and responses are waiting.");
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
        eyebrow="Create your account"
        title="Make room for better questions."
        description="Create your workspace in under a minute. Your profile and surveys are saved to Supabase."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Your name" htmlFor="register-name" required error={errors.name?.message}>
            <Input
              id="register-name"
              autoComplete="name"
              placeholder="Amara Osei"
              invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              {...register("name")}
            />
          </FormField>
          <FormField
            label="Workspace"
            htmlFor="register-company"
            required
            error={errors.company?.message}
          >
            <Input
              id="register-company"
              autoComplete="organization"
              placeholder="Northwind Studio"
              invalid={Boolean(errors.company)}
              aria-describedby={errors.company ? "register-company-error" : undefined}
              {...register("company")}
            />
          </FormField>
        </div>

        <FormField label="Work email" htmlFor="register-email" required error={errors.email?.message}>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            prefix={<Icon name="mail" size={14} />}
            {...register("email")}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="register-password"
          required
          error={errors.password?.message}
          hint={!password ? "At least 8 characters." : undefined}
        >
          <div className="space-y-1.5">
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              placeholder="Choose a password"
              invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "register-password-error" : undefined}
              {...register("password")}
            />
            {password.length > 0 && !errors.password && (
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
        disabled={demoLoading}
        className="mx-auto mt-3 flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-ink-faint transition-colors hover:text-forest disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name="play" size={11} />
        {demoLoading ? "Opening the demo..." : "Or explore the demo workspace"}
      </button>

      <p className="mt-6 flex items-start gap-2 border-t border-line/70 pt-4 text-[10px] leading-relaxed text-ink-faint">
        <Icon name="info" size={12} className="mt-0.5 shrink-0" />
        Accounts use Supabase Auth. If email confirmation is enabled, you will need to confirm your
        address before signing in.
      </p>
    </div>
  );
}

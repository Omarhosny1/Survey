import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("That email address doesn't look right.");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(6, "Passwords must be at least 6 characters."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Tell us what to call you."),
  company: z.string().trim().min(2, "Give your workspace a name."),
  email: emailField,
  password: z.string().min(8, "Use at least 8 characters."),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.password === values.confirm, {
    message: "The passwords don't match.",
    path: ["confirm"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

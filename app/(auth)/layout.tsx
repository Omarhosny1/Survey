import type { ReactNode } from "react";
import { AuthLayout } from "@/app/_components/templates/auth-layout";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

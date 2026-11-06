import type { ReactNode } from "react";
import { DashboardShell } from "@/app/_components/templates/dashboard-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Survey builder",
  description: "Write questions, shape the experience, and publish your survey.",
};

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return children;
}

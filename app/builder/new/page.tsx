import type { Metadata } from "next";
import { BuilderWorkspace } from "@/components/organisms/builder/builder-workspace";

export const metadata: Metadata = {
  title: "New survey",
};

export default function NewSurveyPage() {
  return <BuilderWorkspace />;
}

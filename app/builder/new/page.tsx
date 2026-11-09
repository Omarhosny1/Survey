import type { Metadata } from "next";
import { BuilderWorkspace } from "@/features/survey-builder/components/builder-workspace";

export const metadata: Metadata = {
  title: "New survey",
};

export default function NewSurveyPage() {
  return <BuilderWorkspace />;
}

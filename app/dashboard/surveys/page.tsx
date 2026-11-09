import type { Metadata } from "next";
import { SurveysPage } from "@/features/surveys/components/surveys-page";

export const metadata: Metadata = {
  title: "My surveys",
};
export const instant = false

export default function Page() {
  return <SurveysPage />;
}

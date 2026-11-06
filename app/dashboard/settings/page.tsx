import type { Metadata } from "next";
import { SettingsView } from "@/app/_components/organisms/settings-view";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <SettingsView />;
}

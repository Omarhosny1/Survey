import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "./providers";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SurveyLand — Ask better questions",
    template: "%s · SurveyLand",
  },
  description:
    "SurveyLand is a thoughtful survey platform for teams who want to ask better questions, collect honest answers, and turn them into clear decisions.",
  applicationName: "SurveyLand",
  keywords: ["surveys", "customer research", "feedback", "analytics", "SaaS"],
  authors: [{ name: "SurveyLand" }],
  openGraph: {
    title: "SurveyLand — Ask better questions",
    description:
      "Create, publish, and understand surveys in one calm, beautifully considered workspace.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

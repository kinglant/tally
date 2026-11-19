import type { Metadata } from "next";
import { Settings } from "@/components/views/Settings";

export const metadata: Metadata = { title: "Settings · Tally" };

export default function SettingsPage() {
  return <Settings />;
}

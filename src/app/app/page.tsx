import type { Metadata } from "next";
import { Dashboard } from "@/components/views/Dashboard";

export const metadata: Metadata = { title: "Dashboard · Tally" };

export default function DashboardPage() {
  return <Dashboard />;
}

import type { Metadata } from "next";
import { Login } from "@/components/views/Login";

export const metadata: Metadata = { title: "Sign in · Tally" };

export default function LoginPage() {
  return <Login />;
}

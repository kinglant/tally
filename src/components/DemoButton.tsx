"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function DemoButton({ className = "", label = "Try the live demo" }: { className?: string; label?: string }) {
  const { user, startDemo } = useAuth();
  const router = useRouter();
  return (
    <button
      onClick={() => {
        if (!user) startDemo();
        router.push("/app");
      }}
      className={`btn btn-primary ${className}`}
    >
      {user ? "Open dashboard" : label} <ArrowRight size={16} />
    </button>
  );
}

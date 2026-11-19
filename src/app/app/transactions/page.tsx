import type { Metadata } from "next";
import { Transactions } from "@/components/views/Transactions";

export const metadata: Metadata = { title: "Transactions · Tally" };

export default function TransactionsPage() {
  return <Transactions />;
}

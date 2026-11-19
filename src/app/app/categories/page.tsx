import type { Metadata } from "next";
import { Categories } from "@/components/views/Categories";

export const metadata: Metadata = { title: "Categories · Tally" };

export default function CategoriesPage() {
  return <Categories />;
}

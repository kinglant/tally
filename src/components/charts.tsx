"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/format";
import { useIsDark } from "./ThemeToggle";

const COLORS = {
  light: { income: "#0f9f6e", expense: "#e1475a", grid: "#e3e6ec", text: "#6b7280", panel: "#ffffff", border: "#e3e6ec" },
  dark: { income: "#2fc58f", expense: "#f26b7c", grid: "#252a36", text: "#9097a6", panel: "#12151c", border: "#252a36" },
};

interface MonthPoint {
  month: string;
  income: number;
  expense: number;
}

export function MonthlyChart({ data, currency }: { data: MonthPoint[]; currency: string }) {
  const c = COLORS[useIsDark() ? "dark" : "light"];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={c.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: c.text, fontSize: 12 }} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tick={{ fill: c.text, fontSize: 12 }}
          tickFormatter={(v: number) => formatMoney(v, currency, true)}
        />
        <Tooltip
          cursor={{ fill: c.grid, opacity: 0.5 }}
          contentStyle={{ background: c.panel, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 13 }}
          formatter={(v, name) => [formatMoney(Number(v), currency), name === "income" ? "Income" : "Expenses"]}
        />
        <Bar dataKey="income" fill={c.income} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" fill={c.expense} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface Slice {
  id: string;
  name: string;
  color: string;
  value: number;
}

export function CategoryDonut({ data, currency }: { data: Slice[]; currency: string }) {
  const c = COLORS[useIsDark() ? "dark" : "light"];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2} stroke={c.panel} strokeWidth={2}>
          {data.map((d) => (
            <Cell key={d.id} fill={d.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: c.panel, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 13 }}
          formatter={(v, name) => [formatMoney(Number(v), currency), name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

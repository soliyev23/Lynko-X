"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

interface Stats {
  products: number;
  orders: number;
  newOrders: number;
  revenue: number;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/stats").then(setStats).catch(console.error);
  }, []);

  const cards = [
    { label: t("totalProducts"), value: stats?.products },
    { label: t("totalOrders"), value: stats?.orders },
    { label: t("newOrders"), value: stats?.newOrders, highlight: true },
    {
      label: t("revenue"),
      value: stats != null ? money(stats.revenue) : undefined,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("dashboard")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl border p-5 ${
              c.highlight
                ? "bg-indigo-50 border-indigo-200"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="text-2xl font-bold mt-1">
              {c.value ?? "…"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

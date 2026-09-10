"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";

interface PlatformStats {
  merchants: number;
  stores: number;
  activeStores: number;
  products: number;
  orders: number;
  revenue: number;
  latestStores: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    isActive: boolean;
    createdAt: string;
    owner: { name: string; email: string };
  }[];
}

export default function PlatformStatsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    api<PlatformStats>("/admin/stats").then(setStats).catch(console.error);
  }, []);

  const cards = [
    { label: t("merchants"), value: stats?.merchants },
    {
      label: t("stores"),
      value:
        stats != null ? `${stats.activeStores} / ${stats.stores}` : undefined,
      hint: t("activeStores"),
    },
    { label: t("products"), value: stats?.products },
    { label: t("orders"), value: stats?.orders },
    {
      label: t("turnover"),
      value: stats != null ? money(stats.revenue) : undefined,
      highlight: true,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {t("platform")} — {t("platformStats")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
            <div className="text-2xl font-bold mt-1">{c.value ?? "…"}</div>
            {c.hint && (
              <div className="text-xs text-gray-400 mt-0.5">{c.hint}</div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">{t("latestStores")}</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("name")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("owner")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("plan")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats?.latestStores.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href="/platform/stores"
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-gray-400">/{s.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{s.owner.name}</div>
                  <div className="text-xs text-gray-400">{s.owner.email}</div>
                </td>
                <td className="px-4 py-3">{t(`plan_${s.plan}` as TKey)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {dateTime(s.createdAt)}
                </td>
              </tr>
            ))}
            {stats?.latestStores.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

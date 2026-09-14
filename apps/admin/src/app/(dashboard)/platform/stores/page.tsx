"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateTime } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { ExternalLinkIcon, SearchIcon } from "@/components/icons";
import { SubscriptionBadge, type SubscriptionInfo } from "@/components/badges";
import { dateOnly, tpl } from "@/lib/format";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "BASIC" | "PRO";
  isActive: boolean;
  phone: string | null;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { products: number; orders: number };
  subscription: SubscriptionInfo;
}

const PLANS = ["FREE", "BASIC", "PRO"] as const;

export default function PlatformStoresPage() {
  const { t } = useI18n();
  const [stores, setStores] = useState<StoreRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function load(q = "") {
    const data = await api<StoreRow[]>(
      `/admin/stores${q ? `?search=${encodeURIComponent(q)}` : ""}`,
    );
    setStores(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function patch(id: string, body: { isActive?: boolean; plan?: string }) {
    setError("");
    try {
      const updated = await api<{ id: string; plan: string; isActive: boolean; subscription: SubscriptionInfo }>(
        `/admin/stores/${id}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      setStores((prev) =>
        prev
          ? prev.map((s) =>
              s.id === id
                ? { ...s, plan: updated.plan as StoreRow["plan"], isActive: updated.isActive, subscription: updated.subscription }
                : s,
            )
          : prev,
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("stores")}</h1>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}
      <div className="relative mb-4 max-w-sm">
        <SearchIcon
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder={t("search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            load(e.target.value);
          }}
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 bg-white"
        />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("name")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("owner")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("plan")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("subscription")}</th>
              <th className="text-right px-4 py-3 font-medium">
                {t("products")}
              </th>
              <th className="text-right px-4 py-3 font-medium">{t("orders")}</th>
              <th className="text-center px-4 py-3 font-medium">
                {t("status")}
              </th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores?.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/platform/stores/${s.id}`} className="font-medium text-indigo-600 hover:underline">{s.name}</Link>
                  <a
                    href={`http://localhost:3001/${s.slug}`}
                    target="_blank"
                    className="mt-0.5 flex w-fit items-center gap-1 text-xs text-gray-400 hover:text-indigo-600"
                  >
                    /{s.slug}
                    <ExternalLinkIcon size={11} />
                  </a>
                </td>
                <td className="px-4 py-3">
                  <div>{s.owner.name}</div>
                  <div className="text-xs text-gray-400">{s.owner.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={s.plan}
                    onChange={(e) => patch(s.id, { plan: e.target.value })}
                    className="rounded-lg border border-gray-300 px-2 py-1 bg-white text-sm"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {t(`plan_${p}` as TKey)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <SubscriptionBadge status={s.subscription.status} />
                  {s.subscription.status !== "FREE" && (
                    <div className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                      {s.subscription.expiresAt == null
                        ? t("noExpiry")
                        : s.subscription.status === "EXPIRED"
                          ? tpl(t("expiredOn"), { d: dateOnly(s.subscription.expiresAt) })
                          : tpl(t("daysLeft"), { n: s.subscription.daysLeft ?? 0 })}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">{s._count.products}</td>
                <td className="px-4 py-3 text-right">{s._count.orders}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => patch(s.id, { isActive: !s.isActive })}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                      s.isActive
                        ? "bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                        : "bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                    }`}
                    title={s.isActive ? t("block") : t("activate")}
                  >
                    {s.isActive ? t("activeLabel") : t("blocked")}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {dateTime(s.createdAt)}
                </td>
              </tr>
            ))}
            {stores?.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
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

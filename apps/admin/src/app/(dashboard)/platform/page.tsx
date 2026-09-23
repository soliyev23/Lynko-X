"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import {
  BarChart,
  HBars,
  Panel,
  StatTile,
  longDay,
  pctChange,
  shortDay,
} from "@/components/charts";

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

interface PlatformAnalytics {
  daily: { day: string; orders: number; revenue: number }[];
  newStores: { day: string; count: number }[];
  planBreakdown: { plan: string; count: number }[];
  statusBreakdown: { status: string; count: number }[];
  topStores: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    orders: number;
    revenue: number;
  }[];
  activeStores7d: number;
  period: {
    orders30: number;
    revenue30: number;
    sellingStores30: number;
    ordersPrev30: number;
    revenuePrev30: number;
  };
}

const STATUS_ORDER = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function PlatformStatsPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [an, setAn] = useState<PlatformAnalytics | null>(null);

  useEffect(() => {
    api<PlatformStats>("/admin/stats").then(setStats).catch(console.error);
    api<PlatformAnalytics>("/admin/analytics").then(setAn).catch(console.error);
  }, []);

  if (!stats || !an) return <div className="text-gray-400">{t("loading")}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t("platform")} — {t("analytics")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("last30")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatTile
          label={t("revenue30")}
          value={money(an.period.revenue30)}
          delta={pctChange(an.period.revenue30, an.period.revenuePrev30)}
          deltaLabel={t("vsPrev30")}
          highlight
        />
        <StatTile
          label={t("orders30")}
          value={an.period.orders30}
          delta={pctChange(an.period.orders30, an.period.ordersPrev30)}
          deltaLabel={t("vsPrev30")}
        />
        <StatTile label={t("merchants")} value={stats.merchants} />
        <StatTile
          label={t("stores")}
          value={`${stats.activeStores} / ${stats.stores}`}
          hint={t("activeStores")}
        />
        <StatTile label={t("sellingStores")} value={an.period.sellingStores30} hint={`${an.activeStores7d} — ${t("activeLast7")}`} />
        <StatTile label={t("turnover")} value={money(stats.revenue)} hint={`${stats.orders} ${t("ordersCount")}`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={t("dailyRevenue")} className="lg:col-span-2">
          <BarChart
            emptyText={t("noData")}
            data={an.daily.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.revenue }))}
            tooltipValue={(p) => money(p.value)}
          />
        </Panel>
        <Panel title={t("newStoresDaily")}>
          <BarChart
            emptyText={t("noData")}
            data={an.newStores.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.count }))}
            format={(v) => String(v)}
          />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={t("dailyOrders")}>
          <BarChart
            emptyText={t("noData")}
            data={an.daily.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.orders }))}
            format={(v) => String(v)}
            height={150}
          />
        </Panel>
        <Panel title={t("planBreakdown")}>
          <HBars
            rows={an.planBreakdown.map((p) => ({ label: t(`plan_${p.plan}` as TKey), value: p.count }))}
            format={(v) => `${v}`}
          />
        </Panel>
        <Panel title={t("statusBreakdown")}>
          <HBars
            rows={STATUS_ORDER.map((s) => ({
              label: t(`status_${s}` as TKey),
              value: an.statusBreakdown.find((r) => r.status === s)?.count ?? 0,
            })).filter((r) => r.value > 0)}
            emptyText={t("noData")}
          />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t("topStores")} flush>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">{t("name")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("plan")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("orders")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("revenue")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {an.topStores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/platform/stores/${s.id}`} className="font-medium text-primary-600 hover:underline">{s.name}</Link>
                    <div className="text-xs text-gray-400">/{s.slug}</div>
                  </td>
                  <td className="px-4 py-3">{t(`plan_${s.plan}` as TKey)}</td>
                  <td className="px-4 py-3 text-right">{s.orders}</td>
                  <td className="px-4 py-3 text-right font-medium">{money(s.revenue)}</td>
                </tr>
              ))}
              {an.topStores.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">{t("empty")}</td></tr>
              )}
            </tbody>
          </table>
        </Panel>

        <Panel
          title={t("latestStores")}
          action={<Link href="/platform/stores" className="text-sm text-primary-600 hover:underline">{t("viewAll")}</Link>}
          flush
        >
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">{t("name")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("owner")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("plan")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.latestStores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link href={`/platform/stores/${s.id}`} className="font-medium text-primary-600 hover:underline">{s.name}</Link>
                    <div className="text-xs text-gray-400">/{s.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{s.owner.name}</div>
                    <div className="text-xs text-gray-400">{s.owner.email}</div>
                  </td>
                  <td className="px-4 py-3">{t(`plan_${s.plan}` as TKey)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(s.createdAt)}</td>
                </tr>
              ))}
              {stats.latestStores.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">{t("empty")}</td></tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

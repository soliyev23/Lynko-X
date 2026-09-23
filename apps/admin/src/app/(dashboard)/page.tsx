"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { EmptyRow } from "@/components/EmptyState";
import { PaymentBadge, StatusBadge } from "@/components/badges";
import {
  BarChart,
  HBars,
  Meter,
  Panel,
  StatTile,
  longDay,
  pctChange,
  shortDay,
} from "@/components/charts";
import { ExternalLinkIcon } from "@/components/icons";
import { SubscriptionBadge, type SubscriptionInfo } from "@/components/badges";
import { dateOnly, tpl } from "@/lib/format";

interface Analytics {
  totals: { products: number; orders: number; newOrders: number; revenue: number };
  period: {
    orders30: number;
    revenue30: number;
    ordersPrev30: number;
    revenuePrev30: number;
  };
  daily: { day: string; orders: number; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
  topProducts: {
    productId: string | null;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStock: { productId: string; name: string; stock: number }[];
  recentOrders: {
    id: string;
    number: number;
    customerName: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  usage: { plan: string; products: number; limit: number | null; subscription: SubscriptionInfo };
  store: { name: string; slug: string; theme: string; telegramConfigured: boolean };
}

const STATUS_ORDER = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function DashboardPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api<Analytics>("/analytics").then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-gray-400">{t("loading")}</div>;

  const { totals, period, usage, store } = data;
  const nearLimit =
    usage.limit != null && usage.products >= Math.floor(usage.limit * 0.8);
  const sub = usage.subscription;
  // Obuna ogohlantirishi: muddati o'tgan yoki 7 kun ichida tugaydi
  const subWarning =
    sub.status === "EXPIRED"
      ? tpl(t("subExpired"), { limit: sub.limit ?? 10 })
      : sub.daysLeft != null && sub.daysLeft <= 7
        ? tpl(t(sub.status === "TRIAL" ? "subTrialEnding" : "subExpiringSoon"), { n: sub.daysLeft })
        : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
          <p className="text-sm text-gray-500 mt-1">{store.name}</p>
        </div>
        <a
          href={`http://localhost:3001/${store.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-primary-400 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium bg-white whitespace-nowrap"
        >
          <ExternalLinkIcon size={15} />
          {t("viewStore")}
        </a>
      </div>

      {(subWarning || nearLimit || !store.telegramConfigured) && (
        <div className="space-y-2">
          {subWarning && (
            <div className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm border ${sub.status === "EXPIRED" ? "bg-error-50 border-error-200 text-error-800" : "bg-warning-50 border-warning-200 text-warning-800"}`}>
              <span>{subWarning} {t("subContact")}</span>
              <Link href="/settings" className="font-medium underline whitespace-nowrap">{t("settings")}</Link>
            </div>
          )}
          {nearLimit && (
            <div className="flex items-center justify-between gap-4 bg-warning-50 border border-warning-200 text-warning-800 rounded-xl px-4 py-3 text-sm">
              <span>{t("upgradeHint")}</span>
              <Link href="/settings" className="font-medium underline whitespace-nowrap">
                {t("settings")}
              </Link>
            </div>
          )}
          {!store.telegramConfigured && (
            <div className="flex items-center justify-between gap-4 bg-primary-50 border border-primary-200 text-primary-800 rounded-xl px-4 py-3 text-sm">
              <span>{t("telegramNotSet")}</span>
              <Link href="/settings" className="font-medium underline whitespace-nowrap">
                {t("setUp")}
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label={t("revenue30")}
          value={money(period.revenue30)}
          delta={pctChange(period.revenue30, period.revenuePrev30)}
          deltaLabel={t("vsPrev30")}
        />
        <StatTile
          label={t("orders30")}
          value={period.orders30}
          delta={pctChange(period.orders30, period.ordersPrev30)}
          deltaLabel={t("vsPrev30")}
        />
        <StatTile label={t("newOrders")} value={totals.newOrders} highlight />
        <div className="rounded-2xl border bg-white border-gray-200 p-5">
          <div className="text-sm text-gray-500">{t("planUsage")}</div>
          <div className="text-2xl font-bold mt-1">
            {usage.products}
            <span className="text-base font-normal text-gray-400">
              {" "}
              / {usage.limit ?? t("unlimited")} {t("productsUsed")}
            </span>
          </div>
          <div className="mt-2">
            <Meter value={usage.products} max={usage.limit ?? Math.max(usage.products, 1)} />
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-gray-400 mt-1.5">
            <span>{t("currentPlan")}: {t(`plan_${sub.plan}` as TKey)}</span>
            <SubscriptionBadge status={sub.status} />
          </div>
          {sub.expiresAt && sub.status !== "EXPIRED" && (
            <div className="text-xs text-gray-400 mt-1">{dateOnly(sub.expiresAt)} · {tpl(t("daysLeft"), { n: sub.daysLeft ?? 0 })}</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t("dailyRevenue")} action={<span className="text-xs text-gray-400">{t("last30")}</span>}>
          <BarChart
            emptyText={t("noData")}
            data={data.daily.map((d) => ({
              label: shortDay(d.day),
              title: longDay(d.day),
              value: d.revenue,
            }))}
            tooltipValue={(p) => money(p.value)}
          />
        </Panel>
        <Panel title={t("dailyOrders")} action={<span className="text-xs text-gray-400">{t("last30")}</span>}>
          <BarChart
            emptyText={t("noData")}
            data={data.daily.map((d) => ({
              label: shortDay(d.day),
              title: longDay(d.day),
              value: d.orders,
            }))}
            format={(v) => String(v)}
          />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={t("topProducts")}>
          <HBars
            rows={data.topProducts.map((p) => ({
              label: p.productId ? (
                <Link href={`/products/${p.productId}`} className="hover:underline">
                  {p.name}
                </Link>
              ) : (
                p.name
              ),
              value: p.quantity,
              sub: money(p.revenue),
            }))}
            format={(v) => `${v} ${t("pcs")}`}
            emptyText={t("noData")}
          />
        </Panel>
        <Panel
          title={t("lowStock")}
          action={<span className="text-xs text-gray-400">{t("lowStockHint")}</span>}
        >
          {data.lowStock.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">{t("allGood")}</div>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {data.lowStock.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2 gap-3">
                  <Link href={`/products/${p.productId}`} className="truncate hover:underline">
                    {p.name}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      p.stock === 0 ? "bg-error-100 text-error-700" : "bg-warning-100 text-warning-700"
                    }`}
                  >
                    {p.stock} {t("pcs")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t("statusBreakdown")}>
          <HBars
            rows={STATUS_ORDER.map((s) => ({
              label: t(`status_${s}` as TKey),
              value: data.statusBreakdown.find((r) => r.status === s)?.count ?? 0,
            })).filter((r) => r.value > 0)}
            emptyText={t("noData")}
          />
        </Panel>
      </div>

      <Panel
        title={t("recentOrders")}
        action={
          <Link href="/orders" className="text-sm text-primary-600 hover:underline">
            {t("viewAll")}
          </Link>
        }
        flush
      >
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">{t("customer")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("total")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("status")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("paymentStatus")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <Link href={`/orders/${o.id}`} className="text-primary-600 font-semibold hover:underline">
                    #{o.number}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-right font-medium">{money(o.total)}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-center"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(o.createdAt)}</td>
              </tr>
            ))}
            {data.recentOrders.length === 0 && (
                <EmptyRow colSpan={6} kind="orders" title={t("emptyOrdersTitle")} hint={t("emptyOrdersHint")} />
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

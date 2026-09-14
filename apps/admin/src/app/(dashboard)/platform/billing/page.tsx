"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateOnly, dateTime, money, monthLabel, tpl } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { SubscriptionBadge, type SubscriptionInfo } from "@/components/badges";
import { BarChart, Panel, StatTile, pctChange } from "@/components/charts";

interface StoreSub {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  owner: { name: string; email: string };
  subscription: SubscriptionInfo;
}

interface Billing {
  totals: {
    thisMonth: number;
    lastMonth: number;
    allTime: number;
    paymentsCount: number;
    trial: number;
    active: number;
    expired: number;
    free: number;
    stores: number;
  };
  months: { month: string; amount: number; count: number }[];
  expiringSoon: StoreSub[];
  expired: StoreSub[];
  recentPayments: {
    id: string;
    plan: string;
    amount: number;
    method: string;
    months: number;
    paidAt: string;
    periodStart: string;
    periodEnd: string;
    note: string | null;
    store: { id: string; name: string; slug: string };
    createdBy: { name: string } | null;
  }[];
}

export default function BillingPage() {
  const { t } = useI18n();
  const [data, setData] = useState<Billing | null>(null);

  useEffect(() => {
    api<Billing>("/admin/billing").then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-gray-400">{t("loading")}</div>;
  const { totals } = data;

  const StoreList = ({ rows, empty }: { rows: StoreSub[]; empty: string }) =>
    rows.length === 0 ? (
      <div className="text-sm text-gray-400 py-6 text-center">{empty}</div>
    ) : (
      <ul className="divide-y divide-gray-100 text-sm">
        {rows.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <Link href={`/platform/stores/${s.id}`} className="font-medium text-indigo-600 hover:underline">
                {s.name}
              </Link>
              <div className="text-xs text-gray-400 truncate">
                {s.owner.name} · {s.phone ?? s.owner.email}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-gray-500">{t(`plan_${s.subscription.plan}` as TKey)}</span>
                <SubscriptionBadge status={s.subscription.status} />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {s.subscription.status === "EXPIRED"
                  ? tpl(t("expiredOn"), { d: dateOnly(s.subscription.expiresAt) })
                  : tpl(t("daysLeft"), { n: s.subscription.daysLeft ?? 0 })}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("billing")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("billingHint")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        <StatTile
          label={t("revenueThisMonth")}
          value={money(totals.thisMonth)}
          delta={pctChange(totals.thisMonth, totals.lastMonth)}
          deltaLabel={t("revenueLastMonth").toLowerCase()}
          highlight
        />
        <StatTile label={t("revenueAllTime")} value={money(totals.allTime)} hint={`${totals.paymentsCount} ${t("payments")}`} />
        <StatTile label={t("paidStores")} value={totals.active} />
        <StatTile label={t("trialStores")} value={totals.trial} />
        <StatTile label={t("expiredStores")} value={totals.expired} />
        <StatTile label={t("freeStores")} value={totals.free} hint={`${totals.stores} ${t("stores").toLowerCase()}`} />
      </div>

      <Panel title={t("monthlyRevenue")} action={<span className="text-xs text-gray-400">{t("last12Months")}</span>}>
        <BarChart
          emptyText={t("noData")}
          data={data.months.map((m) => ({ label: monthLabel(m.month), title: monthLabel(m.month), value: m.amount }))}
          tooltipValue={(p) => money(p.value)}
        />
      </Panel>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t("expiringSoon")}>
          <StoreList rows={data.expiringSoon} empty={t("noExpiring")} />
        </Panel>
        <Panel title={t("expiredList")}>
          <StoreList rows={data.expired} empty={t("noExpired")} />
        </Panel>
      </div>

      <Panel title={t("recentPayments")} flush>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">{t("date")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("stores")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("plan")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("amount")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("method")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("period")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("recordedBy")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.recentPayments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 whitespace-nowrap text-gray-500">{dateTime(p.paidAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/platform/stores/${p.store.id}`} className="font-medium text-indigo-600 hover:underline">{p.store.name}</Link>
                  {p.note && <div className="text-xs text-gray-400 truncate max-w-[220px]">{p.note}</div>}
                </td>
                <td className="px-4 py-3">{t(`plan_${p.plan}` as TKey)} · {p.months} {t("monthShort")}</td>
                <td className="px-4 py-3 text-right font-medium">{money(p.amount)}</td>
                <td className="px-4 py-3">{t(`method_${p.method}` as TKey)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">{dateOnly(p.periodStart)} – {dateOnly(p.periodEnd)}</td>
                <td className="px-4 py-3 text-gray-500">{p.createdBy?.name ?? "—"}</td>
              </tr>
            ))}
            {data.recentPayments.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">{t("noPayments")}</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

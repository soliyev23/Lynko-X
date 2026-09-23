"use client";

import Link from "next/link";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { useStoreDetail } from "@/lib/store-context";
import { EmptyRow } from "@/components/EmptyState";
import { PaymentBadge, StatusBadge } from "@/components/badges";
import { BarChart, HBars, Panel, StatTile, longDay, pctChange, shortDay } from "@/components/charts";

const STATUS_ORDER = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

/** Do'kon: tahlil bo'limi */
export default function PlatformStoreAnalyticsPage() {
  const { t } = useI18n();
  const { data } = useStoreDetail();
  const { store, analytics: an } = data;
  const base = `/platform/stores/${store.id}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile label={t("totalRevenue")} value={money(an.totals.revenue)} highlight />
        <StatTile label={t("revenue30")} value={money(an.period.revenue30)} delta={pctChange(an.period.revenue30, an.period.revenuePrev30)} deltaLabel={t("vsPrev30")} />
        <StatTile label={t("orders")} value={an.totals.orders} hint={`${an.period.orders30} — ${t("last30")}`} />
        <StatTile label={t("newOrders")} value={an.totals.newOrders} />
        <StatTile label={t("products")} value={an.totals.products} hint={`${store._count.categories} ${t("categories").toLowerCase()}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t("dailyRevenue")} action={<span className="text-xs text-gray-400">{t("last30")}</span>}>
          <BarChart emptyText={t("noData")} data={an.daily.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.revenue }))} tooltipValue={(p) => money(p.value)} />
        </Panel>
        <Panel title={t("dailyOrders")} action={<span className="text-xs text-gray-400">{t("last30")}</span>}>
          <BarChart emptyText={t("noData")} data={an.daily.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.orders }))} format={(v) => String(v)} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={t("topProducts")}>
          <HBars rows={an.topProducts.map((p) => ({ label: p.name, value: p.quantity, sub: money(p.revenue) }))} format={(v) => `${v} ${t("pcs")}`} emptyText={t("noData")} />
        </Panel>
        <Panel title={t("lowStock")} action={<span className="text-xs text-gray-400">{t("lowStockHint")}</span>}>
          {an.lowStock.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">{t("allGood")}</div>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {an.lowStock.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2 gap-3">
                  <span className="truncate">{p.name}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-error-100 text-error-700" : "bg-warning-100 text-warning-700"}`}>{p.stock} {t("pcs")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t("statusBreakdown")}>
          <HBars
            rows={STATUS_ORDER.map((s) => ({ label: t(`status_${s}` as TKey), value: an.statusBreakdown.find((r) => r.status === s)?.count ?? 0 })).filter((r) => r.value > 0)}
            emptyText={t("noData")}
          />
        </Panel>
      </div>

      <Panel title={t("recentOrders")} action={<Link href={`${base}/orders`} className="text-sm text-primary-600 hover:underline">{t("viewAll")}</Link>} flush>
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
            {an.recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold"><Link href={`${base}/orders/${o.id}`} className="text-primary-600 hover:underline">#{o.number}</Link></td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-right font-medium">{money(o.total)}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-center"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(o.createdAt)}</td>
              </tr>
            ))}
            {an.recentOrders.length === 0 && <EmptyRow colSpan={6} kind="orders" title={t("emptyOrdersTitle")} />}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

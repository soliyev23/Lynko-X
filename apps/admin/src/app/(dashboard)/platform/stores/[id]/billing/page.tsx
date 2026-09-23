"use client";

import { useState } from "react";
import { dateOnly, dateTime, money, tpl } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { can, useAdmin } from "@/lib/admin-context";
import { useStoreDetail } from "@/lib/store-context";
import { SubscriptionBadge } from "@/components/badges";
import { Meter, Panel } from "@/components/charts";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { EmptyRow } from "@/components/EmptyState";

/** Do'kon: obuna va to'lovlar. Moliya va Bosh admin o'zgartiradi, Support faqat ko'radi. */
export default function PlatformStoreBillingPage() {
  const { t } = useI18n();
  const me = useAdmin();
  const { data, setData } = useStoreDetail();
  const [error, setError] = useState("");
  const { store, usage, subscription: sub, payments } = data;

  if (can(me?.adminRole, "billing")) {
    return (
      <div className="space-y-4">
        {error && <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3">{error}</div>}
        <SubscriptionCard
          storeId={store.id}
          plan={store.plan}
          isActive={store.isActive}
          subscription={sub}
          usage={usage}
          payments={payments}
          onError={setError}
          onChange={(next) =>
            setData((d) => ({
              ...d,
              store: { ...d.store, plan: next.plan, isActive: next.isActive },
              subscription: next.subscription,
              usage: { ...d.usage, plan: next.subscription.effectivePlan, limit: next.subscription.limit },
              payments: next.payments,
            }))
          }
        />
      </div>
    );
  }

  const expiryText =
    sub.status === "FREE" || sub.expiresAt == null
      ? t("noExpiry")
      : sub.status === "EXPIRED"
        ? tpl(t("expiredOn"), { d: dateOnly(sub.expiresAt) })
        : `${dateOnly(sub.expiresAt)} · ${tpl(t("daysLeft"), { n: sub.daysLeft ?? 0 })}`;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-info-200 bg-info-50 px-4 py-2.5 text-sm text-info-800">{t("readOnlyHint")}</div>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
        <Panel title={t("subscription")} action={<SubscriptionBadge status={sub.status} />}>
          <dl className="text-sm space-y-3">
            <div><dt className="text-gray-500">{t("plan")}</dt><dd className="font-medium">{t(`plan_${store.plan}` as TKey)} · {money(sub.price)}/{t("monthShort")}</dd></div>
            <div><dt className="text-gray-500">{t("expiresAt")}</dt><dd className="font-medium">{expiryText}</dd></div>
            <div>
              <dt className="text-gray-500 mb-1">{t("planUsage")}</dt>
              <dd><Meter value={usage.products} max={usage.limit ?? Number.POSITIVE_INFINITY} /><span className="mt-1 block text-xs text-gray-500">{usage.products} / {usage.limit ?? "∞"} {t("productsUsed")}</span></dd>
            </div>
          </dl>
        </Panel>
        <Panel title={t("paymentHistory")} flush>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">{t("paidAt")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("plan")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("amount")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("period")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("recordedBy")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 whitespace-nowrap">{dateTime(p.paidAt)}</td>
                  <td className="px-4 py-3">{t(`plan_${p.plan}` as TKey)} · {p.months} {t("monthShort")}</td>
                  <td className="px-4 py-3 text-right font-medium">{money(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateOnly(p.periodStart)} – {dateOnly(p.periodEnd)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.createdBy?.name ?? "—"}</td>
                </tr>
              ))}
              {payments.length === 0 && <EmptyRow colSpan={5} kind="generic" title={t("noPayments")} />}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

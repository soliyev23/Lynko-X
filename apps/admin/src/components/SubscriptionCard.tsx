"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { dateOnly, dateTime, money, tpl } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { SubscriptionBadge, type SubscriptionInfo } from "@/components/badges";
import { Meter, Panel } from "@/components/charts";
import { TrashIcon } from "@/components/icons";

const PLANS = ["FREE", "BASIC", "PRO"] as const;
const PAID_PLANS = ["BASIC", "PRO"] as const;
const METHODS = ["TRANSFER", "CARD", "CASH", "OTHER"] as const;
const PRICES: Record<string, number> = { FREE: 0, BASIC: 99000, PRO: 249000 };

export interface PlanPayment {
  id: string;
  plan: string;
  amount: number;
  method: string;
  months: number;
  paidAt: string;
  periodStart: string;
  periodEnd: string;
  note: string | null;
  createdBy: { name: string } | null;
}

interface StoreSubState {
  plan: "FREE" | "BASIC" | "PRO";
  isActive: boolean;
  subscription: SubscriptionInfo;
}

interface Props {
  storeId: string;
  plan: "FREE" | "BASIC" | "PRO";
  isActive: boolean;
  subscription: SubscriptionInfo;
  usage: { products: number; limit: number | null };
  payments: PlanPayment[];
  onChange: (next: StoreSubState & { payments: PlanPayment[] }) => void;
  onError: (msg: string) => void;
}

/** Owner-panel: do'kon obunasi, muddati, tarif, qo'lda to'lov va tarix. */
export function SubscriptionCard({ storeId, plan, isActive, subscription, usage, payments, onChange, onError }: Props) {
  const { t } = useI18n();
  const [showPay, setShowPay] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pay, setPay] = useState({
    plan: (plan === "FREE" ? "BASIC" : plan) as "BASIC" | "PRO",
    months: 1,
    amount: PRICES[plan === "FREE" ? "BASIC" : plan],
    method: "TRANSFER" as (typeof METHODS)[number],
    paidAt: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [expiry, setExpiry] = useState(subscription.expiresAt ? subscription.expiresAt.slice(0, 10) : "");

  const setPayField = <K extends keyof typeof pay>(k: K, v: (typeof pay)[K]) => {
    setPay((p) => {
      const next = { ...p, [k]: v };
      if (k === "plan" || k === "months") next.amount = PRICES[next.plan] * Number(next.months || 1);
      return next;
    });
  };

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const u = await api<StoreSubState>(`/admin/stores/${storeId}`, { method: "PATCH", body: JSON.stringify(body) });
      onChange({ plan: u.plan, isActive: u.isActive, subscription: u.subscription, payments });
      setExpiry(u.subscription.expiresAt ? u.subscription.expiresAt.slice(0, 10) : "");
      setShowExpiry(false);
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const r = await api<{ payment: PlanPayment; store: StoreSubState }>(`/admin/stores/${storeId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          plan: pay.plan,
          amount: Number(pay.amount),
          method: pay.method,
          months: Number(pay.months),
          paidAt: new Date(pay.paidAt).toISOString(),
          note: pay.note || undefined,
        }),
      });
      onChange({ plan: r.store.plan, isActive: r.store.isActive, subscription: r.store.subscription, payments: [r.payment, ...payments] });
      setExpiry(r.store.subscription.expiresAt ? r.store.subscription.expiresAt.slice(0, 10) : "");
      setShowPay(false);
      setMessage(t("paymentAdded"));
    } catch (e: any) {
      onError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removePayment(id: string) {
    if (!confirm(t("deletePaymentConfirm"))) return;
    try {
      await api(`/admin/stores/${storeId}/payments/${id}`, { method: "DELETE" });
      onChange({ plan, isActive, subscription, payments: payments.filter((p) => p.id !== id) });
    } catch (e: any) {
      onError(e.message);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm";
  const sub = subscription;
  const expiryText =
    sub.status === "FREE"
      ? t("noExpiry")
      : sub.expiresAt == null
        ? t("noExpiry")
        : sub.status === "EXPIRED"
          ? tpl(t("expiredOn"), { d: dateOnly(sub.expiresAt) })
          : `${dateOnly(sub.expiresAt)} · ${tpl(t("daysLeft"), { n: sub.daysLeft ?? 0 })}`;

  return (
    <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
      {/* Obuna holati */}
      <Panel
        title={t("subscription")}
        action={<SubscriptionBadge status={sub.status} />}
      >
        {message && <div className="bg-success-50 text-success-700 text-sm rounded-lg p-2.5 mb-3">{message}</div>}
        <dl className="text-sm space-y-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-500">{t("plan")}</dt>
            <dd>
              <select
                value={plan}
                disabled={busy}
                onChange={(e) => patch({ plan: e.target.value })}
                className="rounded-lg border border-gray-300 px-2 py-1 bg-white text-sm"
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>{t(`plan_${p}` as TKey)}{p !== "FREE" ? ` · ${money(PRICES[p])}` : ""}</option>
                ))}
              </select>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-gray-500">{t("expiresAt")}</dt>
            <dd className="font-medium text-right">{expiryText}</dd>
          </div>
          {sub.status === "EXPIRED" && (
            <div className="text-xs text-error-600">
              {tpl(t("effectivePlanHint"), { plan: t("plan_FREE"), limit: sub.limit ?? "∞" })}
            </div>
          )}
          {sub.status === "TRIAL" && <div className="text-xs text-warning-700">{t("subTrialInfo")}</div>}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t("planUsage")}</span>
              <span>{usage.products} / {usage.limit ?? t("unlimited")}</span>
            </div>
            <Meter value={usage.products} max={usage.limit ?? Math.max(usage.products, 1)} />
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={() => { setShowPay((v) => !v); setShowExpiry(false); }}
            className="rounded-lg border border-gray-300 bg-white hover:border-gray-400 text-gray-700 text-sm font-medium px-3 py-2"
          >
            {t("addPayment")}
          </button>
          {plan !== "FREE" && (
            <button
              type="button"
              onClick={() => { setShowExpiry((v) => !v); setShowPay(false); }}
              className="rounded-lg border border-gray-300 hover:border-primary-400 text-sm font-medium px-3 py-2 bg-white"
            >
              {t("setExpiry")}
            </button>
          )}
        </div>

        {showExpiry && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
            <label className="block text-sm">
              <span className="text-gray-600">{t("expiresAt")}</span>
              <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={input} />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || !expiry}
                onClick={() => patch({ planExpiresAt: new Date(expiry + "T23:59:59").toISOString() })}
                className="rounded-lg bg-gray-900 text-white text-sm font-medium px-3 py-1.5 disabled:opacity-50"
              >
                {t("save")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => patch({ planExpiresAt: null, isTrial: false })}
                className="rounded-lg border border-gray-300 text-sm font-medium px-3 py-1.5 bg-white"
              >
                {t("clearExpiry")}
              </button>
            </div>
          </div>
        )}

        {showPay && (
          <form onSubmit={submitPayment} className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="text-gray-600">{t("plan")}</span>
                <select value={pay.plan} onChange={(e) => setPayField("plan", e.target.value as "BASIC" | "PRO")} className={input}>
                  {PAID_PLANS.map((p) => <option key={p} value={p}>{t(`plan_${p}` as TKey)}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-gray-600">{t("months")}</span>
                <input type="number" min={1} max={24} value={pay.months} onChange={(e) => setPayField("months", Number(e.target.value))} className={input} />
              </label>
              <label className="block text-sm">
                <span className="text-gray-600">{t("amount")}</span>
                <input type="number" min={0} step={1000} value={pay.amount} onChange={(e) => setPayField("amount", Number(e.target.value))} className={input} />
              </label>
              <label className="block text-sm">
                <span className="text-gray-600">{t("method")}</span>
                <select value={pay.method} onChange={(e) => setPayField("method", e.target.value as (typeof METHODS)[number])} className={input}>
                  {METHODS.map((m) => <option key={m} value={m}>{t(`method_${m}` as TKey)}</option>)}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-gray-600">{t("paidAt")}</span>
                <input type="date" value={pay.paidAt} onChange={(e) => setPayField("paidAt", e.target.value)} className={input} />
              </label>
              <label className="block text-sm">
                <span className="text-gray-600">{t("note")}</span>
                <input value={pay.note} onChange={(e) => setPayField("note", e.target.value)} className={input} />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={busy} className="rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1.5 disabled:opacity-50">
                {busy ? t("saving") : t("save")}
              </button>
              <button type="button" onClick={() => setShowPay(false)} className="rounded-lg border border-gray-300 text-sm font-medium px-3 py-1.5 bg-white">
                {t("cancel")}
              </button>
            </div>
          </form>
        )}
      </Panel>

      {/* To'lovlar tarixi */}
      <Panel title={t("paymentHistory")} flush>
        {payments.length === 0 ? (
          <div className="px-5 pb-6 text-sm text-gray-400">{t("noPayments")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium">{t("date")}</th>
                <th className="text-left px-3 py-2.5 font-medium">{t("plan")}</th>
                <th className="text-right px-3 py-2.5 font-medium">{t("amount")}</th>
                <th className="text-left px-3 py-2.5 font-medium">{t("period")}</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 whitespace-nowrap">
                    <div>{dateOnly(p.paidAt)}</div>
                    <div className="text-xs text-gray-400">{t(`method_${p.method}` as TKey)}{p.createdBy ? ` · ${p.createdBy.name}` : ""}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    {t(`plan_${p.plan}` as TKey)} · {p.months} {t("monthShort")}
                    {p.note && <div className="text-xs text-gray-400 truncate max-w-[180px]" title={p.note}>{p.note}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium whitespace-nowrap">{money(p.amount)}</td>
                  <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{dateOnly(p.periodStart)} – {dateOnly(p.periodEnd)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => removePayment(p.id)}
                      aria-label={t("delete")}
                      title={dateTime(p.paidAt)}
                      className="text-gray-400 hover:text-error-600 p-1"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

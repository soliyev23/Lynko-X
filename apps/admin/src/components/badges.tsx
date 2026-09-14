"use client";

import { useI18n, type TKey } from "@/lib/i18n";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-violet-100 text-violet-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const PAY_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-700",
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {t(`status_${status}` as TKey)}
    </span>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAY_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {t(`pay_${status}` as TKey)}
    </span>
  );
}

const SUB_COLORS: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  TRIAL: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-red-100 text-red-700",
};

export interface SubscriptionInfo {
  plan: "FREE" | "BASIC" | "PRO";
  effectivePlan: "FREE" | "BASIC" | "PRO";
  status: "FREE" | "TRIAL" | "ACTIVE" | "EXPIRED";
  isTrial: boolean;
  expiresAt: string | null;
  daysLeft: number | null;
  limit: number | null;
  price: number;
}

/** Obuna holati: Bepul / Sinov / Faol / Muddati o'tgan */
export function SubscriptionBadge({ status }: { status: SubscriptionInfo["status"] }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${SUB_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {t(`sub_${status}` as TKey)}
    </span>
  );
}

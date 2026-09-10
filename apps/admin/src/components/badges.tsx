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

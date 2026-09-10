"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { PaymentBadge, StatusBadge } from "@/components/badges";

interface Order {
  id: string;
  number: number;
  customerName: string;
  phone: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

const FILTERS = ["", "NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    api<Order[]>(`/orders${filter ? `?status=${filter}` : ""}`)
      .then(setOrders)
      .catch(console.error);
  }, [filter]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("orders")}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition ${
              filter === f
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
            }`}
          >
            {f ? t(`status_${f}` as TKey) : "Barchasi"}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
              <th className="text-left px-4 py-3 font-medium">
                {t("customer")}
              </th>
              <th className="text-right px-4 py-3 font-medium">{t("total")}</th>
              <th className="text-center px-4 py-3 font-medium">
                {t("status")}
              </th>
              <th className="text-center px-4 py-3 font-medium">
                {t("paymentStatus")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders?.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/orders/${o.id}`}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    #{o.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {dateTime(o.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customerName}</div>
                  <div className="text-gray-500 text-xs">{o.phone}</div>
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {money(o.total)}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-center">
                  <PaymentBadge status={o.paymentStatus} />
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
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

"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { PaymentBadge, StatusBadge } from "@/components/badges";

interface OrderDetail {
  id: string;
  number: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  phone: string;
  address: string | null;
  note: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
}

const STATUSES = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<OrderDetail>(`/orders/${id}`).then(setOrder).catch(console.error);
  }, [id]);

  async function changeStatus(status: string) {
    setError("");
    try {
      const updated = await api<OrderDetail>(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrder(updated);
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!order) return <div className="text-gray-400">{t("loading")}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold">
          {t("order")} #{order.number}
        </h1>
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="text-gray-400 text-sm">
          {dateTime(order.createdAt)}
        </span>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">{t("customer")}</h2>
          <dl className="text-sm space-y-1.5">
            <div>
              <span className="text-gray-500">{t("name")}: </span>
              {order.customerName}
            </div>
            <div>
              <span className="text-gray-500">{t("phone")}: </span>
              <a href={`tel:${order.phone}`} className="text-primary-600">
                {order.phone}
              </a>
            </div>
            {order.address && (
              <div>
                <span className="text-gray-500">{t("address")}: </span>
                {order.address}
              </div>
            )}
            {order.note && (
              <div>
                <span className="text-gray-500">{t("note")}: </span>
                {order.note}
              </div>
            )}
            <div>
              <span className="text-gray-500">{t("paymentMethod")}: </span>
              {t(`method_${order.paymentMethod}` as TKey)}
            </div>
          </dl>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-3">{t("status")}</h2>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={order.status === s}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition ${
                  order.status === s
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"
                }`}
              >
                {t(`status_${s}` as TKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("items")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("price")}</th>
              <th className="text-right px-4 py-3 font-medium">
                {t("quantity")}
              </th>
              <th className="text-right px-4 py-3 font-medium">{t("total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 text-right">{money(item.price)}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {money(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="text-sm">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-gray-500">
                {t("subtotal")}
              </td>
              <td className="px-4 py-2 text-right">{money(order.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right text-gray-500">
                {t("deliveryFee")}
              </td>
              <td className="px-4 py-2 text-right">
                {money(order.deliveryFee)}
              </td>
            </tr>
            <tr className="font-bold border-t border-gray-200">
              <td colSpan={3} className="px-4 py-3 text-right">
                {t("total")}
              </td>
              <td className="px-4 py-3 text-right">{money(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { useStoreDetail } from "@/lib/store-context";
import { PaymentBadge, StatusBadge } from "@/components/badges";
import { Panel } from "@/components/charts";
import { ArrowLeftIcon } from "@/components/icons";

interface OrderDetail {
  id: string; number: number; status: string; paymentStatus: string; paymentMethod: string;
  customerName: string; phone: string; address: string | null; note: string | null;
  subtotal: number; deliveryFee: number; total: number; createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
  payments: { id: string; provider: string; amount: number; status: string; createdAt: string }[];
}

/** Do'kon buyurtmasi: faqat ko'rish (owner sotuvchi nomidan holatni o'zgartirmaydi) */
export default function PlatformStoreOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const { t } = useI18n();
  const { data: { store } } = useStoreDetail();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<OrderDetail>(`/admin/stores/${store.id}/orders/${orderId}`).then(setOrder).catch((e) => setError(e.message));
  }, [store.id, orderId]);

  if (error) return <div className="text-error-600">{error}</div>;
  if (!order) return <div className="text-gray-400">{t("loading")}</div>;

  return (
    <div className="space-y-4">
      <Link href={`/platform/stores/${store.id}/orders`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeftIcon size={15} /> {t("orders")}
      </Link>
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold">{t("order")} #{order.number}</h2>
        <StatusBadge status={order.status} />
        <PaymentBadge status={order.paymentStatus} />
        <span className="text-sm text-gray-500">{dateTime(order.createdAt)}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-4">
        <Panel title={t("customer")}>
          <dl className="text-sm space-y-2">
            <div><dt className="text-gray-500">{t("name")}</dt><dd className="font-medium">{order.customerName}</dd></div>
            <div><dt className="text-gray-500">{t("phone")}</dt><dd className="font-medium">{order.phone}</dd></div>
            <div><dt className="text-gray-500">{t("address")}</dt><dd>{order.address || "—"}</dd></div>
            <div><dt className="text-gray-500">{t("note")}</dt><dd>{order.note || "—"}</dd></div>
            <div><dt className="text-gray-500">{t("paymentMethod")}</dt><dd>{t(`method_${order.paymentMethod}` as TKey) === `method_${order.paymentMethod}` ? order.paymentMethod : t(`method_${order.paymentMethod}` as TKey)}</dd></div>
          </dl>
        </Panel>
        <Panel title={t("items")} flush>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">{t("name")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("price")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("quantity")}</th>
                <th className="text-right px-5 py-3 font-medium">{t("total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((it) => (
                <tr key={it.id}>
                  <td className="px-5 py-3">{it.name}</td>
                  <td className="px-4 py-3 text-right">{money(it.price)}</td>
                  <td className="px-4 py-3 text-right">{it.quantity}</td>
                  <td className="px-5 py-3 text-right font-medium">{money(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              <tr><td colSpan={3} className="px-5 py-2 text-right text-gray-500">{t("subtotal")}</td><td className="px-5 py-2 text-right">{money(order.subtotal)}</td></tr>
              <tr><td colSpan={3} className="px-5 py-2 text-right text-gray-500">{t("deliveryFee")}</td><td className="px-5 py-2 text-right">{money(order.deliveryFee)}</td></tr>
              <tr className="border-t border-gray-200"><td colSpan={3} className="px-5 py-3 text-right font-semibold">{t("total")}</td><td className="px-5 py-3 text-right font-bold">{money(order.total)}</td></tr>
            </tfoot>
          </table>
        </Panel>
      </div>

      {order.payments.length > 0 && (
        <Panel title={t("payments")} flush>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-5 py-3 font-medium">{t("method")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("amount")}</th>
                <th className="text-center px-4 py-3 font-medium">{t("status")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 uppercase text-xs font-semibold text-gray-600">{p.provider}</td>
                  <td className="px-4 py-3 text-right">{money(p.amount)}</td>
                  <td className="px-4 py-3 text-center"><PaymentBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

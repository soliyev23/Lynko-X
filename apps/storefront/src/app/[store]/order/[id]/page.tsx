"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { ArrowLeftIcon, CheckCircleIcon } from "@/components/icons";

interface OrderInfo {
  id: string;
  number: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: { name: string; price: number; quantity: number }[];
  payments: { id: string; provider: string; status: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Yangi",
  CONFIRMED: "Tasdiqlangan",
  SHIPPED: "Yo'lda",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilingan",
};

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ store: string; id: string }>;
}) {
  const { store: slug, id } = use(params);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api<OrderInfo>(`/storefront/${slug}/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [slug, id]);

  useEffect(load, [load]);

  const pendingMockPayment =
    order?.paymentMethod === "ONLINE_MOCK" &&
    order.paymentStatus === "PENDING" &&
    order.payments.find((p) => p.provider === "mock" && p.status === "PENDING");

  async function payMock() {
    if (!pendingMockPayment) return;
    setPaying(true);
    setError("");
    try {
      await api(`/payments/mock/${pendingMockPayment.id}/confirm`, {
        method: "POST",
      });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  if (!order) {
    return (
      <div className="text-center t-muted py-20">{error || "Yuklanmoqda..."}</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="flex justify-center mb-4 t-primary">
        <CheckCircleIcon size={56} strokeWidth={1.5} />
      </div>
      <h1 className="t-heading text-2xl font-bold mb-2">
        Buyurtmangiz qabul qilindi!
      </h1>
      <p className="t-muted mb-6">
        Buyurtma raqami: <b>#{order.number}</b> · Holat:{" "}
        <b>{STATUS_LABELS[order.status] ?? order.status}</b>
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 mb-4">
          {error}
        </div>
      )}

      {pendingMockPayment && (
        <div className="t-soft border t-border t-rounded-lg p-5 mb-6">
          <p className="t-muted mb-3">
            To'lov kutilmoqda. Bu test rejimi — haqiqiy pul o'tmaydi.
          </p>
          <button onClick={payMock} disabled={paying} className="t-btn px-6 py-2.5">
            {paying ? "To'lanmoqda..." : `To'lash (test) — ${money(order.total)}`}
          </button>
        </div>
      )}

      {order.paymentStatus === "PAID" && (
        <div className="flex items-center justify-center gap-2 t-soft t-primary t-rounded-lg p-4 mb-6 font-medium">
          <CheckCircleIcon size={18} />
          To'lov qabul qilindi
        </div>
      )}

      <div className="t-card-border p-5 text-left text-sm space-y-1.5 mb-8">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between">
            <span className="t-muted">
              {i.name} × {i.quantity}
            </span>
            <span>{money(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between t-muted pt-2 border-t t-divider">
          <span>Yetkazish</span>
          <span>{money(order.deliveryFee)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-2 border-t t-divider">
          <span>Jami</span>
          <span>{money(order.total)}</span>
        </div>
      </div>

      <p className="text-sm t-muted mb-6">
        Buyurtma holatini{" "}
        <Link href={`/${slug}/track`} className="t-link">
          kuzatish sahifasida
        </Link>{" "}
        raqam va telefoningiz orqali ko'rishingiz mumkin.
      </p>

      <Link
        href={`/${slug}`}
        className="inline-flex items-center gap-1.5 t-link font-medium"
      >
        <ArrowLeftIcon size={15} />
        Do'konga qaytish
      </Link>
    </div>
  );
}

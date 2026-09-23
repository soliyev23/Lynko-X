"use client";

import { use, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import {
  ArrowLeftIcon,
  CheckIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";

interface TrackedOrder {
  id: string;
  number: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  items: { name: string; price: number; quantity: number }[];
}

const STEPS = [
  { key: "NEW", label: "Qabul qilindi" },
  { key: "CONFIRMED", label: "Tasdiqlandi" },
  { key: "SHIPPED", label: "Yo'lda" },
  { key: "DELIVERED", label: "Yetkazildi" },
];

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = use(params);
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      const q = new URLSearchParams({ number: number.trim(), phone });
      setOrder(await api<TrackedOrder>(`/storefront/${slug}/track?${q}`));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const currentStep = order
    ? STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm t-muted hover:underline"
      >
        <ArrowLeftIcon size={15} />
        Do'konga qaytish
      </Link>
      <h1 className="t-heading text-2xl font-bold mt-4 mb-2">
        Buyurtmani kuzatish
      </h1>
      <p className="t-muted text-sm mb-6">
        Buyurtma raqami va buyurtma berishda kiritgan telefon raqamingizni
        yozing.
      </p>

      <form onSubmit={submit} className="t-card-border p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Buyurtma raqami</span>
            <input
              required
              inputMode="numeric"
              placeholder="1001"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
              className="t-input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Telefon</span>
            <input
              required
              type="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="t-input mt-1"
            />
          </label>
        </div>
        {error && (
          <div className="bg-error-50 text-error-700 text-sm rounded-xl p-3">
            {error}
          </div>
        )}
        <button disabled={busy} className="t-btn px-5 py-2.5">
          <SearchIcon size={16} />
          {busy ? "Qidirilmoqda..." : "Tekshirish"}
        </button>
      </form>

      {order && (
        <div className="mt-6 t-card-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold">Buyurtma #{order.number}</div>
            <div className="text-sm t-muted">
              {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
            </div>
          </div>

          {order.status === "CANCELLED" ? (
            <div className="flex items-center gap-2 bg-error-50 border border-error-200 text-error-700 rounded-xl p-3 text-sm font-medium mb-5">
              <XIcon size={16} />
              Buyurtma bekor qilingan
            </div>
          ) : (
            <ol className="flex items-center mb-6">
              {STEPS.map((s, i) => {
                const done = i <= currentStep;
                return (
                  <li
                    key={s.key}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {i > 0 && (
                      <span
                        className="absolute top-3.5 right-1/2 w-full h-0.5"
                        style={{
                          background: done ? "var(--primary)" : "var(--border)",
                        }}
                      />
                    )}
                    <span
                      className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={
                        done
                          ? {
                              background: "var(--primary)",
                              color: "var(--primary-text)",
                            }
                          : {
                              background: "var(--primary-soft)",
                              color: "var(--muted)",
                              border: "1px solid var(--border)",
                            }
                      }
                    >
                      {done ? <CheckIcon size={14} /> : i + 1}
                    </span>
                    <span
                      className={`mt-2 text-xs text-center ${done ? "font-medium" : "t-muted"}`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="text-sm space-y-1.5">
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
            <div className="text-xs t-muted pt-1">
              To'lov: {order.paymentStatus === "PAID" ? "to'langan" : "kutilmoqda"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

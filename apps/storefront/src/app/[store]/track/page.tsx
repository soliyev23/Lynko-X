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

  const input =
    "mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";
  const currentStep = order
    ? STEPS.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600"
      >
        <ArrowLeftIcon size={15} />
        Do'konga qaytish
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-2">Buyurtmani kuzatish</h1>
      <p className="text-gray-500 text-sm mb-6">
        Buyurtma raqami va buyurtma berishda kiritgan telefon raqamingizni
        yozing.
      </p>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              Buyurtma raqami
            </span>
            <input
              required
              inputMode="numeric"
              placeholder="1001"
              value={number}
              onChange={(e) => setNumber(e.target.value.replace(/\D/g, ""))}
              className={input}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Telefon</span>
            <input
              required
              type="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={input}
            />
          </label>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">
            {error}
          </div>
        )}
        <button
          disabled={busy}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl px-5 py-2.5"
        >
          <SearchIcon size={16} />
          {busy ? "Qidirilmoqda..." : "Tekshirish"}
        </button>
      </form>

      {order && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold">Buyurtma #{order.number}</div>
            <div className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("uz-UZ")}
            </div>
          </div>

          {order.status === "CANCELLED" ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm font-medium mb-5">
              <XIcon size={16} />
              Buyurtma bekor qilingan
            </div>
          ) : (
            <ol className="flex items-center mb-6">
              {STEPS.map((s, i) => {
                const done = i <= currentStep;
                return (
                  <li key={s.key} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <span
                        className={`absolute top-3.5 right-1/2 w-full h-0.5 ${
                          i <= currentStep ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                    >
                      {done ? <CheckIcon size={14} /> : i + 1}
                    </span>
                    <span
                      className={`mt-2 text-xs text-center ${
                        done ? "text-gray-900 font-medium" : "text-gray-400"
                      }`}
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
                <span className="text-gray-600">
                  {i.name} × {i.quantity}
                </span>
                <span>{money(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-100">
              <span>Yetkazish</span>
              <span>{money(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
              <span>Jami</span>
              <span>{money(order.total)}</span>
            </div>
            <div className="text-xs text-gray-400 pt-1">
              To'lov: {order.paymentStatus === "PAID" ? "to'langan" : "kutilmoqda"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

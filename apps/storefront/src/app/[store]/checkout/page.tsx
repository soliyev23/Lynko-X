"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type StoreInfo } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { BanknoteIcon, CreditCardIcon } from "@/components/icons";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = use(params);
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "CASH_ON_DELIVERY" as "CASH_ON_DELIVERY" | "ONLINE_MOCK",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<StoreInfo>(`/storefront/${slug}`).then(setStore).catch(console.error);
  }, [slug]);

  const deliveryFee = store?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const res = await api<{ orderId: string }>(
        `/storefront/${slug}/orders`,
        {
          method: "POST",
          body: JSON.stringify({
            customerName: form.customerName,
            phone: form.phone,
            address: form.address || undefined,
            note: form.note || undefined,
            paymentMethod: form.paymentMethod,
            items: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId ?? undefined,
              quantity: i.quantity,
            })),
          }),
        },
      );
      clear();
      router.push(`/${slug}/order/${res.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (items.length === 0 && !busy) {
    router.replace(`/${slug}/cart`);
    return null;
  }

  const input =
    "mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white";

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buyurtma berish</h1>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3">
            {error}
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Ismingiz *</span>
          <input
            required
            value={form.customerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerName: e.target.value }))
            }
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Telefon raqamingiz *
          </span>
          <input
            required
            type="tel"
            placeholder="+998 90 123 45 67"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Yetkazib berish manzili
          </span>
          <input
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Izoh</span>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className={input}
          />
        </label>

        <div>
          <span className="text-sm font-medium text-gray-700">
            To'lov usuli
          </span>
          <div className="mt-2 space-y-2">
            {(
              [
                [
                  "CASH_ON_DELIVERY",
                  "Naqd — qabul qilganda to'layman",
                  BanknoteIcon,
                ],
                ["ONLINE_MOCK", "Onlayn to'lov (test rejimi)", CreditCardIcon],
              ] as const
            ).map(([value, label, PayIcon]) => (
              <label
                key={value}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                  form.paymentMethod === value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-300 bg-white hover:border-emerald-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === value}
                  onChange={() =>
                    setForm((f) => ({ ...f, paymentMethod: value }))
                  }
                  className="accent-emerald-600"
                />
                <PayIcon size={18} className="text-gray-500 shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 text-sm space-y-1.5">
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between">
              <span className="text-gray-600">
                {i.name}
                {i.variantName ? ` (${i.variantName})` : ""} × {i.quantity}
              </span>
              <span>{money(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-gray-500 pt-2 border-t border-gray-100">
            <span>Yetkazish</span>
            <span>{money(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
            <span>Jami</span>
            <span>{money(total)}</span>
          </div>
        </div>

        <button
          disabled={busy}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3.5 text-lg transition"
        >
          {busy ? "Yuborilmoqda..." : `Buyurtma berish — ${money(total)}`}
        </button>
      </form>
    </div>
  );
}

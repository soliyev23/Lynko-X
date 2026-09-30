"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type StoreInfo } from "@/lib/api";
import { useCart, type CartItem } from "@/lib/cart";
import { money } from "@/lib/format";
import { BanknoteIcon, CreditCardIcon } from "@/components/icons";

/** Tiklash havolasi orqali qaytgan savat va kontaktlar */
interface RecoveredSession {
  customerName: string | null;
  phone: string;
  address: string | null;
  items: {
    productId: string;
    variantId: string | null;
    variantName: string | null;
    name: string;
    price: number;
    image: string | null;
    stock: number;
    quantity: number;
  }[];
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = use(params);
  const router = useRouter();
  const { items, subtotal, clear, replaceAll, loaded } = useCart();
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
  // Checkout sessiyasi: telefon kiritilgach savat serverda saqlanadi (tugallanmagan xaridlar)
  const sessionKey = `lynkox_checkout_${slug}`;
  const sessionToken = useRef<string | null>(null);
  const [recoverChecked, setRecoverChecked] = useState(false);

  useEffect(() => {
    api<StoreInfo>(`/storefront/${slug}`).then(setStore).catch(console.error);
  }, [slug]);

  // Tiklash havolasi (?recover=TOKEN): savat va kontaktlar qaytariladi
  useEffect(() => {
    try {
      sessionToken.current = localStorage.getItem(sessionKey);
    } catch {}
    const recover = new URLSearchParams(window.location.search).get("recover");
    if (!recover) {
      setRecoverChecked(true);
      return;
    }
    api<RecoveredSession>(`/storefront/${slug}/checkout-session/${recover}`)
      .then((s) => {
        const restored: CartItem[] = s.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantName: i.variantName,
          name: i.name,
          price: i.price,
          image: i.image,
          stock: i.stock,
          quantity: i.quantity,
        }));
        replaceAll(restored);
        setForm((f) => ({
          ...f,
          customerName: s.customerName ?? "",
          phone: s.phone,
          address: s.address ?? "",
        }));
        sessionToken.current = recover;
        try {
          localStorage.setItem(sessionKey, recover);
        } catch {}
      })
      .catch(() => undefined)
      .finally(() => {
        window.history.replaceState(null, "", `/${slug}/checkout`);
        setRecoverChecked(true);
      });
  }, [slug, sessionKey, replaceAll]);

  // Telefon to'liq kiritilgach savat serverda saqlanadi (1.5 s kechikish bilan)
  const phoneDigits = form.phone.replace(/\D/g, "").length;
  useEffect(() => {
    if (!recoverChecked || busy || items.length === 0 || phoneDigits < 9) return;
    const timer = setTimeout(() => {
      api<{ token: string }>(`/storefront/${slug}/checkout-session`, {
        method: "PUT",
        body: JSON.stringify({
          token: sessionToken.current ?? undefined,
          customerName: form.customerName || undefined,
          phone: form.phone,
          address: form.address || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? undefined,
            quantity: i.quantity,
          })),
        }),
      })
        .then((r) => {
          sessionToken.current = r.token;
          try {
            localStorage.setItem(sessionKey, r.token);
          } catch {}
        })
        .catch(() => undefined);
    }, 1500);
    return () => clearTimeout(timer);
  }, [slug, sessionKey, items, form.customerName, form.phone, form.address, phoneDigits, recoverChecked, busy]);

  // Savat bo'sh bo'lsa savat sahifasiga (tiklash tekshirilgandan keyin)
  useEffect(() => {
    if (recoverChecked && loaded && items.length === 0 && !busy) {
      router.replace(`/${slug}/cart`);
    }
  }, [recoverChecked, loaded, items.length, busy, router, slug]);

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
            checkoutToken: sessionToken.current ?? undefined,
            items: items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId ?? undefined,
              quantity: i.quantity,
            })),
          }),
        },
      );
      sessionToken.current = null;
      try {
        localStorage.removeItem(sessionKey);
      } catch {}
      clear();
      router.push(`/${slug}/order/${res.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!recoverChecked || !loaded || (items.length === 0 && !busy)) return null;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="t-heading text-2xl font-bold mb-6">Buyurtma berish</h1>
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="bg-error-50 text-error-700 text-sm rounded-xl p-3">
            {error}
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium">Ismingiz *</span>
          <input
            required
            value={form.customerName}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerName: e.target.value }))
            }
            className="t-input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Telefon raqamingiz *</span>
          <input
            required
            type="tel"
            placeholder="+998 90 123 45 67"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="t-input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Yetkazib berish manzili</span>
          <input
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            className="t-input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Izoh</span>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="t-input mt-1"
          />
        </label>

        <div>
          <span className="text-sm font-medium">To'lov usuli</span>
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
            ).map(([value, label, PayIcon]) => {
              const active = form.paymentMethod === value;
              return (
                <label
                  key={value}
                  className={`flex items-center gap-3 border p-3 cursor-pointer transition t-rounded ${
                    active ? "t-soft" : "t-surface t-border"
                  }`}
                  style={active ? { borderColor: "var(--primary)" } : undefined}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={active}
                    onChange={() =>
                      setForm((f) => ({ ...f, paymentMethod: value }))
                    }
                    style={{ accentColor: "var(--primary)" }}
                  />
                  <PayIcon size={18} className="t-muted shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="t-card-border p-4 text-sm space-y-1.5">
          {items.map((i) => (
            <div key={`${i.productId}:${i.variantId ?? ""}`} className="flex justify-between">
              <span className="t-muted">
                {i.name}
                {i.variantName ? ` (${i.variantName})` : ""} × {i.quantity}
              </span>
              <span>{money(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between t-muted pt-2 border-t t-divider">
            <span>Yetkazish</span>
            <span>{money(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t t-divider">
            <span>Jami</span>
            <span>{money(total)}</span>
          </div>
        </div>

        <button disabled={busy} className="t-btn w-full py-3.5 text-lg font-semibold">
          {busy ? "Yuborilmoqda..." : `Buyurtma berish — ${money(total)}`}
        </button>
      </form>
    </div>
  );
}

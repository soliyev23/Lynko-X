"use client";

import { use } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import {
  ArrowRightIcon,
  CartIcon,
  MinusIcon,
  PlusIcon,
  XIcon,
} from "@/components/icons";

export default function CartPage({
  params,
}: {
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = use(params);
  const { items, subtotal, setQuantity, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center mb-4 t-muted opacity-60">
          <CartIcon size={56} strokeWidth={1.5} />
        </div>
        <p className="t-muted mb-6">Savatingiz bo'sh</p>
        <Link href={`/${slug}`} className="t-btn px-6 py-3">
          Xarid qilishni boshlash
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="t-heading text-2xl font-bold mb-6">Savat</h1>
      <div className="t-card-border divide-y t-divider">
        {items.map((item) => (
          <div
            key={`${item.productId}:${item.variantId ?? ""}`}
            className="flex items-center gap-4 p-4"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-16 h-16 object-cover t-soft t-rounded"
              />
            ) : (
              <div className="w-16 h-16 t-soft t-rounded" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.name}</div>
              {item.variantName && (
                <div className="text-xs t-muted">{item.variantName}</div>
              )}
              <div className="text-sm t-muted">{money(item.price)}</div>
            </div>
            <div className="t-stepper">
              <button
                onClick={() =>
                  setQuantity(item.productId, item.variantId, item.quantity - 1)
                }
              >
                <MinusIcon size={14} />
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(item.productId, item.variantId, item.quantity + 1)
                }
              >
                <PlusIcon size={14} />
              </button>
            </div>
            <div className="w-28 text-right font-semibold">
              {money(item.price * item.quantity)}
            </div>
            <button
              onClick={() => remove(item.productId, item.variantId)}
              className="t-muted hover:text-red-500 p-1"
              aria-label="O'chirish"
            >
              <XIcon size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-6">
        <div className="text-lg">
          Jami: <span className="font-bold">{money(subtotal)}</span>
          <span className="text-sm t-muted ml-2">(+ yetkazish narxi)</span>
        </div>
        <Link href={`/${slug}/checkout`} className="t-btn px-6 py-3">
          Buyurtma berish
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>
  );
}

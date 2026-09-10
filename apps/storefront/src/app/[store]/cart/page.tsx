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
        <div className="flex justify-center mb-4 text-gray-300">
          <CartIcon size={56} strokeWidth={1.5} />
        </div>
        <p className="text-gray-500 mb-6">Savatingiz bo'sh</p>
        <Link
          href={`/${slug}`}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-6 py-3"
        >
          Xarid qilishni boshlash
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Savat</h1>
      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {items.map((item) => (
          <div
            key={`${item.productId}:${item.variantId ?? ""}`}
            className="flex items-center gap-4 p-4"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-16 h-16 rounded-xl object-cover bg-gray-100"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{item.name}</div>
              {item.variantName && (
                <div className="text-xs text-gray-400">{item.variantName}</div>
              )}
              <div className="text-sm text-gray-500">{money(item.price)}</div>
            </div>
            <div className="flex items-center border border-gray-300 rounded-xl">
              <button
                onClick={() =>
                  setQuantity(item.productId, item.variantId, item.quantity - 1)
                }
                className="px-3 py-2 text-gray-500 hover:text-gray-900"
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
                className="px-3 py-2 text-gray-500 hover:text-gray-900"
              >
                <PlusIcon size={14} />
              </button>
            </div>
            <div className="w-28 text-right font-semibold">
              {money(item.price * item.quantity)}
            </div>
            <button
              onClick={() => remove(item.productId, item.variantId)}
              className="text-gray-400 hover:text-red-500 p-1"
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
          <span className="text-sm text-gray-400 ml-2">
            (+ yetkazish narxi)
          </span>
        </div>
        <Link
          href={`/${slug}/checkout`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-6 py-3"
        >
          Buyurtma berish
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </div>
  );
}

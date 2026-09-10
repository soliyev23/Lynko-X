"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { StoreInfo } from "@/lib/api";
import { CartIcon, PhoneIcon } from "@/components/icons";

export function Header({ store }: { store: StoreInfo }) {
  const { count } = useCart();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href={`/${store.slug}`} className="flex items-center gap-3">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt=""
              className="w-9 h-9 rounded-lg object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {store.name[0]}
            </div>
          )}
          <span className="font-bold text-lg">{store.name}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/${store.slug}/track`}
            className="hidden md:block text-sm text-gray-600 hover:text-emerald-600"
          >
            Buyurtmani kuzatish
          </Link>
          {store.phone && (
            <a
              href={`tel:${store.phone}`}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-600"
            >
              <PhoneIcon size={15} />
              {store.phone}
            </a>
          )}
          <Link
            href={`/${store.slug}/cart`}
            className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            <CartIcon size={17} />
            Savat
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

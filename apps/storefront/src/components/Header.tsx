"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import type { StoreInfo } from "@/lib/api";
import type { Theme } from "@/lib/themes";
import { CartIcon, PhoneIcon } from "@/components/icons";

function Logo({ store, theme }: { store: StoreInfo; theme: Theme }) {
  return (
    <Link href={`/${store.slug}`} className="flex items-center gap-3">
      {store.logoUrl ? (
        <img
          src={store.logoUrl}
          alt=""
          className="w-9 h-9 object-cover t-rounded"
        />
      ) : (
        <div className="w-9 h-9 t-soft t-primary flex items-center justify-center font-bold t-rounded">
          {store.name[0]}
        </div>
      )}
      <span className={`t-heading text-lg ${theme.headingClass}`}>
        {store.name}
      </span>
    </Link>
  );
}

function CartButton({ slug }: { slug: string }) {
  const { count } = useCart();
  return (
    <Link
      href={`/${slug}/cart`}
      className="t-btn relative px-4 py-2 text-sm"
    >
      <CartIcon size={17} />
      Savat
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

export function Header({ store, theme }: { store: StoreInfo; theme: Theme }) {
  const secondary = (
    <>
      <Link
        href={`/${store.slug}/track`}
        className="hidden md:block text-sm t-muted hover:underline"
      >
        Buyurtmani kuzatish
      </Link>
      {store.phone && (
        <a
          href={`tel:${store.phone}`}
          className="hidden sm:flex items-center gap-1.5 text-sm t-muted hover:underline"
        >
          <PhoneIcon size={15} />
          {store.phone}
        </a>
      )}
    </>
  );

  if (theme.header === "center") {
    return (
      <header className="t-surface border-b t-border sticky top-0 z-10">
        <div
          className={`${theme.container} mx-auto px-4 py-3 grid grid-cols-3 items-center`}
        >
          <div className="flex items-center gap-4">{secondary}</div>
          <div className="flex justify-center">
            <Logo store={store} theme={theme} />
          </div>
          <div className="flex justify-end">
            <CartButton slug={store.slug} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="t-surface border-b t-border sticky top-0 z-10">
      <div
        className={`${theme.container} mx-auto px-4 py-3 flex items-center justify-between gap-4`}
      >
        <Logo store={store} theme={theme} />
        <div className="flex items-center gap-4">
          {secondary}
          <CartButton slug={store.slug} />
        </div>
      </div>
    </header>
  );
}

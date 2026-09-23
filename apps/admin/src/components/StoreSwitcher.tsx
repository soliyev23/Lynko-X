"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { SubscriptionBadge, type SubscriptionInfo } from "@/components/badges";
import { ChevronDownIcon, SearchIcon, ShieldIcon, StoreIcon } from "@/components/icons";

interface Row {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  subscription: SubscriptionInfo;
}

let cache: Row[] | null = null;

/**
 * Owner sidebar'ida do'kon tanlagich. Do'kon ichida joriy do'kon nomi, platforma sahifalarida
 * «Platforma administratori» yozuvi trigger bo'ladi. Ro'yxat sidebar'ning o'ng tomonida ochiladi.
 */
export function StoreSwitcher({ currentId }: { currentId?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [rows, setRows] = useState<Row[]>(cache ?? []);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Row[]>("/admin/stores")
      .then((r) => {
        cache = r;
        setRows(r);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = currentId ? rows.find((r) => r.id === currentId) : undefined;
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? rows.filter((r) => r.name.toLowerCase().includes(s) || r.slug.includes(s)) : rows;
  }, [rows, q]);

  function go(id: string) {
    // Do'kon ichida joriy bo'lim saqlanadi (buyurtma tafsiloti ro'yxatga qaytadi)
    const inStore = /^\/platform\/stores\/[^/]+/.test(pathname);
    const suffix = inStore ? pathname.replace(/^\/platform\/stores\/[^/]+/, "") : "";
    const tab = suffix.startsWith("/orders/") ? "/orders" : suffix;
    setOpen(false);
    router.push(`/platform/stores/${id}${tab}`);
  }

  const Avatar = ({ r, size = "h-8 w-8 text-sm" }: { r?: Row; size?: string }) =>
    r?.logoUrl ? (
      <img src={r.logoUrl} alt="" className={`${size} shrink-0 rounded-lg object-cover bg-slate-800`} />
    ) : (
      <span className={`${size} shrink-0 rounded-lg bg-primary-600/20 text-primary-300 flex items-center justify-center font-bold`}>
        {r ? r.name[0] : <StoreIcon size={16} />}
      </span>
    );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-800"
      >
        {currentId ? (
          <>
            <Avatar r={current} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-100">{current?.name ?? "…"}</span>
              <span className="block truncate text-xs text-slate-500">{current ? `/${current.slug}` : t("switchStore")}</span>
            </span>
          </>
        ) : (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-slate-300">
            <ShieldIcon size={14} className="shrink-0 text-primary-400" />
            <span className="truncate">{t("platformAdmin")}</span>
          </span>
        )}
        <ChevronDownIcon size={16} className={`shrink-0 text-slate-400 transition-transform ${open ? "-rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-full top-0 z-50 ml-3 w-80 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50">
          <div className="border-b border-slate-800 p-2">
            <div className="relative">
              <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("searchStore")}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-8 pr-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto py-1">
            {filtered.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={r.id === currentId}
                  onClick={() => go(r.id)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                    r.id === currentId ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Avatar r={r} size="h-7 w-7 text-xs" />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${r.isActive ? "" : "line-through opacity-70"}`}>{r.name}</span>
                    <span className="block truncate text-[11px] text-slate-500">/{r.slug}</span>
                  </span>
                  <SubscriptionBadge status={r.subscription.status} />
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-slate-500">{t("emptyStoresTitle")}</li>}
          </ul>
          <Link
            href="/platform/stores"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-slate-800 px-3 py-2.5 text-sm font-medium text-primary-300 hover:bg-slate-800"
          >
            <StoreIcon size={16} />
            {t("allStores")}
          </Link>
        </div>
      )}
    </div>
  );
}

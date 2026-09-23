"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken, setToken } from "@/lib/api";
import { useI18n, type Locale } from "@/lib/i18n";
import { LogoMark } from "@/components/Logo";
import {
  BarChartIcon,
  CartIcon,
  ChevronsLeftIcon,
  CreditCardIcon,
  GlobeIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  PaletteIcon,
  ShieldIcon,
  SlidersIcon,
  StoreIcon,
  UsersIcon,
  SunIcon,
  MoonIcon,
} from "@/components/icons";

interface Store {
  id: string;
  name: string;
  slug: string;
}

type Role = "MERCHANT" | "ADMIN";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [store, setStore] = useState<Store | null>(null);
  const [role, setRole] = useState<Role>("MERCHANT");
  const [ready, setReady] = useState(false);
  // Sidebar standart holatda yopiq (faqat ikonkalar); ochilganda kontent ustiga chiqadi
  const [open, setOpen] = useState(false);
  // Rejim: localStorage'da saqlanadi, <html class="dark"> orqali qo'llanadi
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("lynkox_admin_theme", next ? "dark" : "light");
    } catch {}
  };
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<{ user: { role: Role }; store: Store | null }>("/auth/me")
      .then((res) => {
        setStore(res.store);
        setRole(res.user.role);
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  // Rolga mos bo'limga yo'naltirish
  useEffect(() => {
    if (!ready) return;
    const inPlatform = pathname.startsWith("/platform");
    if (role === "ADMIN" && !inPlatform) router.replace("/platform");
    if (role === "MERCHANT" && inPlatform) router.replace("/");
  }, [ready, role, pathname, router]);

  // Sahifa almashganda sidebar yopiladi; Escape ham yopadi
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        {t("loading")}
      </div>
    );
  }

  const merchantNav = [
    { href: "/", label: t("dashboard"), icon: HomeIcon },
    { href: "/products", label: t("products"), icon: PackageIcon },
    { href: "/orders", label: t("orders"), icon: CartIcon },
    { href: "/design", label: t("design"), icon: PaletteIcon },
    { href: "/settings", label: t("settings"), icon: SlidersIcon },
  ];
  const platformNav = [
    { href: "/platform", label: t("platformStats"), icon: BarChartIcon },
    { href: "/platform/stores", label: t("stores"), icon: StoreIcon },
    { href: "/platform/billing", label: t("billing"), icon: CreditCardIcon },
    { href: "/platform/users", label: t("users"), icon: UsersIcon },
  ];
  const nav = role === "ADMIN" ? platformNav : merchantNav;
  const home = role === "ADMIN" ? "/platform" : "/";
  const isRoot = (href: string) => href === "/" || href === "/platform";
  const otherLocale: Locale = locale === "uz" ? "ru" : "uz";

  // Yopiq holatda ikonka yonida chiqadigan izoh
  const tip = (label: string) =>
    !open && (
      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    );
  const itemBase = `group relative flex items-center h-10 rounded-lg text-sm font-medium transition-colors ${
    open ? "gap-3 px-3" : "justify-center"
  }`;
  const itemIdle = "text-slate-300 hover:bg-slate-800 hover:text-white";

  return (
    <div className="min-h-screen">
      {/* Ochiq holatda orqa fon: bosilsa yopiladi */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px]"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 text-white transition-[width] duration-200 ease-out ${
          open ? "w-64 shadow-2xl shadow-black/40" : "w-16"
        }`}
        aria-label="Sidebar"
      >
        {/* Logo va ochish/yopish tugmasi */}
        <div
          className={`border-b border-slate-800 ${
            open ? "flex items-center gap-3 h-16 px-4" : "flex flex-col items-center gap-1 py-3"
          }`}
        >
          <Link href={home} onClick={close} className="flex items-center gap-2.5" aria-label="LYNKO-X">
            <LogoMark size={32} tone="dark" className="shrink-0" />
            {open && (
              <span className="text-lg font-extrabold tracking-tight leading-none">
                LYNKO<span className="text-primary-400">-X</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("sidebarClose") : t("sidebarOpen")}
            aria-expanded={open}
            className={`group relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white ${
              open ? "ml-auto" : ""
            }`}
          >
            {open ? <ChevronsLeftIcon size={18} /> : <MenuIcon size={18} />}
            {tip(t("sidebarOpen"))}
          </button>
        </div>

        {/* Do'kon / rol */}
        {open && (
          <div className="border-b border-slate-800 px-4 py-3">
            {role === "ADMIN" ? (
              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                <ShieldIcon size={14} className="text-primary-400" />
                {t("platformAdmin")}
              </div>
            ) : (
              store && (
                <>
                  <div className="truncate text-sm font-medium text-slate-200">{store.name}</div>
                  <div className="text-xs text-slate-500">{t("merchantPanel")}</div>
                </>
              )
            )}
          </div>
        )}

        {/* Bo'limlar */}
        <nav className="flex-1 space-y-1 p-2">
          {nav.map((item) => {
            const active = isRoot(item.href)
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className={`${itemBase} ${active ? "bg-primary-600 text-white" : itemIdle}`}
              >
                <item.icon size={18} className="shrink-0" />
                {open && <span className="truncate">{item.label}</span>}
                {tip(item.label)}
              </Link>
            );
          })}
        </nav>

        {/* Pastki qism: vitrina, til, chiqish */}
        <div className="space-y-1 border-t border-slate-800 p-2">
          {role === "MERCHANT" && store && (
            <a
              href={`${STOREFRONT_URL}/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className={`${itemBase} ${itemIdle}`}
            >
              <GlobeIcon size={18} className="shrink-0" />
              {open && <span className="truncate">{t("viewStore")}</span>}
              {tip(t("viewStore"))}
            </a>
          )}

          {open ? (
            <div className="flex items-center gap-1 px-3 py-1.5">
              {(["uz", "ru"] as Locale[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={`rounded px-2 py-1 text-xs font-semibold uppercase transition-colors ${
                    locale === l ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLocale(otherLocale)}
              className={`${itemBase} ${itemIdle} w-full text-xs font-bold uppercase`}
            >
              {locale}
              {tip(t("switchLang"))}
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={dark}
            className={`${itemBase} ${itemIdle} w-full text-left`}
          >
            {dark ? <SunIcon size={18} className="shrink-0" /> : <MoonIcon size={18} className="shrink-0" />}
            {open && <span className="truncate">{dark ? t("lightMode") : t("darkMode")}</span>}
            {tip(dark ? t("lightMode") : t("darkMode"))}
          </button>

          <button
            type="button"
            onClick={() => {
              setToken(null);
              router.replace("/login");
            }}
            className={`${itemBase} ${itemIdle} w-full text-left`}
          >
            <LogOutIcon size={18} className="shrink-0" />
            {open && <span className="truncate">{t("logout")}</span>}
            {tip(t("logout"))}
          </button>
        </div>
      </aside>

      {/* Kontent doim tor panel kengligida chapdan joy qoldiradi; panel ochilganda siljimaydi */}
      <main className="min-h-screen min-w-0 pl-16">
        <div className="mx-auto w-full max-w-7xl p-8 overflow-x-auto">{children}</div>
      </main>
    </div>
  );
}

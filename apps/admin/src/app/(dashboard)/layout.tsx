"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken, setToken } from "@/lib/api";
import { useI18n, type Locale } from "@/lib/i18n";
import { LogoMark } from "@/components/Logo";
import { StoreSwitcher } from "@/components/StoreSwitcher";
import { AdminProvider, type AdminMe } from "@/lib/admin-context";
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
  ClipboardIcon,
  InfoIcon,
  ListIcon,
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

interface NavItem {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  /** Ichki bo'limlar: sidebar ochiq va bo'lim faol bo'lganda ko'rinadi */
  children?: { href: string; label: string }[];
}

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001";

/** Do'kon nomidan avatar uchun bosh harflar (ko'pi bilan ikkita) */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

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
  const [adminMe, setAdminMe] = useState<AdminMe | null>(null);
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
  // Kontent varaq ichida aylanadi; sahifa almashganda varaq boshiga qaytadi
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 });
  }, [pathname]);
  // Qobiq ochiq paytda hujjatning o'zi aylanmaydi (globals.css: .app-shell)
  useEffect(() => {
    document.documentElement.classList.add("app-shell");
    return () => document.documentElement.classList.remove("app-shell");
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<{ user: { id: string; name: string; email: string; role: Role; adminRole?: "OWNER" | "SUPPORT" | "FINANCE" | null }; store: Store | null }>("/auth/me")
      .then((res) => {
        setStore(res.store);
        setRole(res.user.role);
        if (res.user.role === "ADMIN") {
          setAdminMe({ id: res.user.id, name: res.user.name, email: res.user.email, adminRole: res.user.adminRole ?? "SUPPORT" });
        }
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

  // Sotuvchi paneli boshidan qurilmoqda: bo'limlar birma-bir qaytariladi
  const merchantNav: NavItem[] = [
    { href: "/", label: t("home"), icon: HomeIcon },
    {
      href: "/orders",
      label: t("orders"),
      icon: CartIcon,
      children: [
        { href: "/orders/drafts", label: t("drafts") },
        { href: "/orders/abandoned", label: t("abandonedCheckouts") },
      ],
    },
  ];
  const platformNav: NavItem[] = [
    { href: "/platform", label: t("platformStats"), icon: BarChartIcon },
    { href: "/platform/stores", label: t("stores"), icon: StoreIcon },
    { href: "/platform/orders", label: t("orders"), icon: ListIcon },
    { href: "/platform/billing", label: t("billing"), icon: CreditCardIcon },
    { href: "/platform/users", label: t("users"), icon: UsersIcon },
    { href: "/platform/audit", label: t("audit"), icon: ClipboardIcon },
  ];
  // Owner do'kon ichida bo'lsa: do'kon bo'limlari alohida guruh
  const storeId = role === "ADMIN" ? /^\/platform\/stores\/([^/]+)/.exec(pathname)?.[1] : undefined;
  const storeNav = storeId
    ? [
        { href: `/platform/stores/${storeId}`, label: t("analyticsTab"), icon: BarChartIcon, exact: true },
        { href: `/platform/stores/${storeId}/orders`, label: t("orders"), icon: CartIcon },
        { href: `/platform/stores/${storeId}/products`, label: t("products"), icon: PackageIcon },
        { href: `/platform/stores/${storeId}/billing`, label: t("subscription"), icon: CreditCardIcon },
        { href: `/platform/stores/${storeId}/info`, label: t("infoTab"), icon: InfoIcon },
      ]
    : [];
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
  const itemBase = `group relative flex items-center h-9 rounded-lg text-sm font-medium transition-colors ${
    open ? "gap-3 px-3" : "justify-center"
  }`;
  const itemIdle = "text-slate-400 hover:bg-white/[0.06] hover:text-white";
  const itemActive = "bg-white/10 text-white";

  return (
    <div className="h-dvh overflow-hidden bg-slate-900">
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
          className={`${
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
        {open && role === "ADMIN" && (
          <div className="px-3 pb-2">
            <StoreSwitcher currentId={storeId} />
          </div>
        )}

        {/* Bo'limlar */}
        <nav className="flex-1 space-y-0.5 px-2 py-1 overflow-y-auto">
          {storeNav.length > 0 && (
            <>
              {open && <div className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("storeSections")}</div>}
              {storeNav.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`${itemBase} ${active ? itemActive : itemIdle}`}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {open && <span className="truncate">{item.label}</span>}
                    {tip(item.label)}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-white/[0.08]" />
              {open && <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t("platformSections")}</div>}
            </>
          )}
          {nav.map((item) => {
            // Do'kon ichida platforma bo'limlari faol bo'lmaydi (do'kon guruhi ko'rsatadi)
            const inSection = isRoot(item.href)
              ? pathname === item.href
              : !storeId && pathname.startsWith(item.href);
            const activeChild = item.children?.find((c) => pathname.startsWith(c.href));
            const active = inSection && !activeChild;
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={`${itemBase} ${active ? itemActive : itemIdle}`}
                >
                  <item.icon size={18} className="shrink-0" />
                  {open && <span className="truncate">{item.label}</span>}
                  {tip(item.label)}
                </Link>
                {open && item.children && inSection && (
                  <div className="mb-1 mt-0.5 space-y-0.5">
                    {item.children.map((child) => {
                      const childActive = child === activeChild;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={close}
                          aria-current={childActive ? "page" : undefined}
                          className={`flex h-8 items-center rounded-lg pl-11 pr-3 text-[13px] font-medium transition-colors ${
                            childActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Pastki qism: vitrina, til, chiqish */}
        <div className="space-y-0.5 border-t border-white/[0.08] p-2">
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

        {/* Sotuvchi: do'kon identifikatori (avatar + nom) */}
        {role === "MERCHANT" && store && (
          <div className={`border-t border-white/[0.08] py-3 ${open ? "px-3" : "flex justify-center px-2"}`}>
            <div className={`group relative flex items-center ${open ? "gap-3" : ""}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">
                {initials(store.name)}
              </span>
              {open && (
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{store.name}</div>
                  <div className="truncate text-xs text-slate-500">{t("merchantPanel")}</div>
                </div>
              )}
              {tip(store.name)}
            </div>
          </div>
        )}
      </aside>

      {/* Kontent doim tor panel kengligida chapdan joy qoldiradi; panel ochilganda siljimaydi */}
      {/* Kontent: to'q ramka ichida yumaloq burchakli och varaq */}
      <main className="h-full min-w-0 pl-16">
        <div className="h-full p-2 pl-0">
          <div ref={sheetRef} className="h-full overflow-y-auto overscroll-contain rounded-2xl bg-surface-page ring-1 ring-black/5 dark:ring-white/5">
            <div className="mx-auto w-full max-w-7xl p-8 overflow-x-auto"><AdminProvider value={adminMe}>{children}</AdminProvider></div>
          </div>
        </div>
      </main>
    </div>
  );
}

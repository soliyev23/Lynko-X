"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken, setToken } from "@/lib/api";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  BarChartIcon,
  CartIcon,
  GlobeIcon,
  HomeIcon,
  LogOutIcon,
  PackageIcon,
  PaletteIcon,
  ShieldIcon,
  SlidersIcon,
  StoreIcon,
  UsersIcon,
} from "@/components/icons";

interface Store {
  id: string;
  name: string;
  slug: string;
}

type Role = "MERCHANT" | "ADMIN";

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
    { href: "/platform/users", label: t("users"), icon: UsersIcon },
  ];
  const nav = role === "ADMIN" ? platformNav : merchantNav;
  const isRoot = (href: string) => href === "/" || href === "/platform";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar ekranga yopishib turadi; faqat asosiy qism skroll bo'ladi */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-slate-700">
          <div className="text-2xl font-bold text-indigo-400">LYNKO-X</div>
          {role === "ADMIN" ? (
            <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-1">
              <ShieldIcon size={14} />
              {t("platformAdmin")}
            </div>
          ) : (
            store && (
              <div className="mt-1">
                <div className="text-sm text-slate-300 truncate">{store.name}</div>
                <div className="text-xs text-slate-500">{t("merchantPanel")}</div>
              </div>
            )
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = isRoot(item.href)
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <item.icon size={18} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-700 space-y-2">
          {role === "MERCHANT" && store && (
            <a
              href={`http://localhost:3001/${store.slug}`}
              target="_blank"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white px-3 py-2"
            >
              <GlobeIcon size={16} className="shrink-0" />
              {t("viewStore")}
            </a>
          )}
          <div className="flex items-center gap-1 px-3">
            {(["uz", "ru"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`text-xs rounded px-2 py-1 uppercase font-semibold ${
                  locale === l
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setToken(null);
              router.replace("/login");
            }}
            className="w-full flex items-center gap-2 text-left text-sm text-slate-400 hover:text-white px-3 py-2"
          >
            <LogOutIcon size={16} className="shrink-0" />
            {t("logout")}
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}

"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { dateOnly } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { can, useAdmin } from "@/lib/admin-context";
import { STOREFRONT_URL, StoreDetailProvider, type StoreDetail } from "@/lib/store-context";
import { SubscriptionBadge } from "@/components/badges";
import { ExternalLinkIcon, AlertTriangleIcon } from "@/components/icons";
import { Button } from "@/components/ui";

/** Do'kon sahifalari uchun umumiy qism: sarlavha, bloklash, bo'limlar (tab) */
export default function PlatformStoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const me = useAdmin();
  const pathname = usePathname();
  const [data, setDataState] = useState<StoreDetail | null>(null);
  const [error, setError] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const d = await api<StoreDetail>(`/admin/stores/${id}`);
    setDataState(d);
  }, [id]);

  useEffect(() => {
    setDataState(null);
    refresh().catch((e) => setError(e.message));
  }, [refresh]);

  const setData = useCallback((updater: (d: StoreDetail) => StoreDetail) => {
    setDataState((d) => (d ? updater(d) : d));
  }, []);

  async function toggleActive(next: boolean) {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      const u = await api<{ isActive: boolean; blockReason: string | null; blockedAt: string | null; subscription: StoreDetail["subscription"] }>(
        `/admin/stores/${id}`,
        { method: "PATCH", body: JSON.stringify(next ? { isActive: true } : { isActive: false, blockReason: reason }) },
      );
      setData((d) => ({ ...d, store: { ...d.store, isActive: u.isActive, blockReason: u.blockReason, blockedAt: u.blockedAt }, subscription: u.subscription }));
      setBlocking(false);
      setReason("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) return <div className="text-error-600">{error}</div>;
  if (!data) return <div className="text-gray-400">{t("loading")}</div>;

  const { store, subscription } = data;
  const base = `/platform/stores/${id}`;
  const tabs = [
    { href: base, label: t("analyticsTab"), exact: true },
    { href: `${base}/orders`, label: t("orders") },
    { href: `${base}/products`, label: t("products") },
    { href: `${base}/billing`, label: t("subscription") },
    { href: `${base}/info`, label: t("infoTab") },
  ];
  const canSupport = can(me?.adminRole, "support");

  return (
    <StoreDetailProvider value={{ data, setData, refresh }}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {error && <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3">{error}</div>}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl font-bold shrink-0">{store.name[0]}</div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold truncate">{store.name}</h1>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${store.isActive ? "bg-success-100 text-success-700" : "bg-error-100 text-error-700"}`}>
                    {store.isActive ? t("activeLabel") : t("blocked")}
                  </span>
                  <span className="text-xs text-gray-500">{t(`plan_${store.plan}` as TKey)}</span>
                  <SubscriptionBadge status={subscription.status} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  <a href={`${STOREFRONT_URL}/${store.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline">
                    /{store.slug} <ExternalLinkIcon size={12} />
                  </a>
                  <span>{store.owner.name} · {store.owner.email}</span>
                  <span>{t("registered")}: {dateOnly(store.createdAt)}</span>
                </div>
                {!store.isActive && (
                  <div className="mt-3 inline-flex items-start gap-2 rounded-lg bg-error-50 border border-error-200 px-3 py-2 text-sm text-error-800">
                    <AlertTriangleIcon size={16} className="mt-0.5 shrink-0" />
                    <span>
                      <b>{t("blockReason")}:</b> {store.blockReason || "—"}
                      {store.blockedAt && <span className="text-error-600"> · {dateOnly(store.blockedAt)}</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {canSupport && (
              <div className="shrink-0 lg:w-72">
                {store.isActive ? (
                  blocking ? (
                    <div className="rounded-xl border border-error-200 bg-error-50 p-3 space-y-2">
                      <label className="block text-xs font-medium text-error-800" htmlFor="block-reason">{t("blockReason")}</label>
                      <textarea
                        id="block-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t("blockReasonPlaceholder")}
                        rows={2}
                        className="w-full rounded-lg border border-error-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-error-200"
                      />
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm" disabled={busy} onClick={() => toggleActive(false)}>{t("block")}</Button>
                        <Button variant="ghost" size="sm" onClick={() => setBlocking(false)}>{t("cancel")}</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="danger" onClick={() => setBlocking(true)} className="w-full lg:w-auto">{t("block")}</Button>
                  )
                ) : (
                  <Button variant="secondary" disabled={busy} onClick={() => toggleActive(true)} className="w-full lg:w-auto">{t("activate")}</Button>
                )}
              </div>
            )}
          </div>

          <nav className="mt-5 -mb-5 sm:-mb-6 flex gap-1 overflow-x-auto border-t border-gray-100 pt-1" aria-label="Do'kon bo'limlari">
            {tabs.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    active ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </div>
    </StoreDetailProvider>
  );
}

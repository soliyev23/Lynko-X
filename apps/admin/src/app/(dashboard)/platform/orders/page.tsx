"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { EmptyRow } from "@/components/EmptyState";
import { PaymentBadge, StatusBadge } from "@/components/badges";
import { Pagination } from "@/components/Pagination";
import { SearchIcon } from "@/components/icons";

interface Row {
  id: string; number: number; customerName: string; phone: string; total: number;
  status: string; paymentStatus: string; createdAt: string;
  store: { id: string; name: string; slug: string };
}
interface Page { items: Row[]; total: number; page: number; pages: number }

const STATUSES = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

/** Owner-panel: barcha do'konlar ichidan buyurtma qidirish */
export default function PlatformOrdersPage() {
  const { t } = useI18n();
  const [page, setPage] = useState<Page | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [p, setP] = useState(1);

  useEffect(() => {
    const q = new URLSearchParams({ page: String(p) });
    if (search.trim()) q.set("search", search.trim());
    if (status) q.set("status", status);
    const timer = setTimeout(() => {
      api<Page>(`/admin/orders?${q}`).then(setPage).catch(console.error);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, status, p]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("orders")}</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">{t("orderSearchHint")}</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative w-full max-w-md">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            autoFocus
            value={search}
            onChange={(e) => { setSearch(e.target.value); setP(1); }}
            placeholder={t("orderSearchPlaceholder")}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 bg-white"
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setP(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">{t("all")}</option>
          {STATUSES.map((s) => <option key={s} value={s}>{t(`status_${s}` as TKey)}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">{t("store")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("customer")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("phone")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("total")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("status")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("paymentStatus")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {page?.items.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold">
                  <Link href={`/platform/stores/${o.store.id}/orders/${o.id}`} className="text-primary-600 hover:underline">#{o.number}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/platform/stores/${o.store.id}`} className="font-medium hover:underline">{o.store.name}</Link>
                  <div className="text-xs text-gray-400">/{o.store.slug}</div>
                </td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{o.phone}</td>
                <td className="px-4 py-3 text-right font-medium">{money(o.total)}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-center"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(o.createdAt)}</td>
              </tr>
            ))}
            {page && page.items.length === 0 && <EmptyRow colSpan={8} kind="orders" title={t("emptyOrdersTitle")} hint={t("orderSearchHint")} />}
          </tbody>
        </table>
        {page && <Pagination page={page.page} pages={page.pages} total={page.total} onPage={setP} />}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { useStoreDetail } from "@/lib/store-context";
import { EmptyRow } from "@/components/EmptyState";
import { PaymentBadge, StatusBadge } from "@/components/badges";
import { Panel } from "@/components/charts";
import { Pagination } from "@/components/Pagination";
import { SearchIcon } from "@/components/icons";

interface Row {
  id: string; number: number; customerName: string; phone: string; total: number;
  status: string; paymentStatus: string; paymentMethod: string; createdAt: string;
  _count: { items: number };
}
interface Page { items: Row[]; total: number; page: number; pages: number }

const STATUSES = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

/** Do'kon: buyurtmalar (faqat ko'rish) */
export default function PlatformStoreOrdersPage() {
  const { t } = useI18n();
  const { data: { store } } = useStoreDetail();
  const [page, setPage] = useState<Page | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [p, setP] = useState(1);

  useEffect(() => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (search.trim()) q.set("search", search.trim());
    q.set("page", String(p));
    const timer = setTimeout(() => {
      api<Page>(`/admin/stores/${store.id}/orders?${q}`).then(setPage).catch(console.error);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [store.id, status, search, p]);

  const base = `/platform/stores/${store.id}/orders`;

  return (
    <Panel
      title={`${t("orders")}${page ? ` (${page.total})` : ""}`}
      flush
      action={
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setP(1); }}
              placeholder={t("orderSearchPlaceholder")}
              className="w-56 rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-2 text-sm"
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setP(1); }} className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm">
            <option value="">{t("all")}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{t(`status_${s}` as TKey)}</option>)}
          </select>
        </div>
      }
    >
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="text-left px-5 py-3 font-medium">#</th>
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
              <td className="px-5 py-3 font-semibold"><Link href={`${base}/${o.id}`} className="text-primary-600 hover:underline">#{o.number}</Link></td>
              <td className="px-4 py-3">{o.customerName}<div className="text-xs text-gray-400">{o._count.items} {t("pcs")}</div></td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{o.phone}</td>
              <td className="px-4 py-3 text-right font-medium">{money(o.total)}</td>
              <td className="px-4 py-3 text-center"><StatusBadge status={o.status} /></td>
              <td className="px-4 py-3 text-center"><PaymentBadge status={o.paymentStatus} /></td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(o.createdAt)}</td>
            </tr>
          ))}
          {page && page.items.length === 0 && <EmptyRow colSpan={7} kind="orders" title={t("emptyOrdersTitle")} />}
        </tbody>
      </table>
      {page && <Pagination page={page.page} pages={page.pages} total={page.total} onPage={setP} />}
    </Panel>
  );
}

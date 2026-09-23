"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { STOREFRONT_URL, useStoreDetail } from "@/lib/store-context";
import { EmptyRow } from "@/components/EmptyState";
import { Panel } from "@/components/charts";
import { Pagination } from "@/components/Pagination";
import { CheckIcon, SearchIcon, XIcon } from "@/components/icons";

interface Row {
  id: string; name: string; slug: string; price: number; stock: number; isActive: boolean;
  images: string[]; createdAt: string; category: { name: string } | null;
  variants: { name: string; stock: number; price: number | null }[];
}
interface Page { items: Row[]; total: number; page: number; pages: number }

/** Do'kon: mahsulotlar (faqat ko'rish) */
export default function PlatformStoreProductsPage() {
  const { t } = useI18n();
  const { data: { store } } = useStoreDetail();
  const [page, setPage] = useState<Page | null>(null);
  const [search, setSearch] = useState("");
  const [p, setP] = useState(1);

  useEffect(() => {
    const q = new URLSearchParams({ page: String(p) });
    if (search.trim()) q.set("search", search.trim());
    const timer = setTimeout(() => {
      api<Page>(`/admin/stores/${store.id}/products?${q}`).then(setPage).catch(console.error);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [store.id, search, p]);

  const stockOf = (r: Row) => (r.variants.length ? r.variants.reduce((s, v) => s + v.stock, 0) : r.stock);

  return (
    <Panel
      title={`${t("products")}${page ? ` (${page.total})` : ""}`}
      flush
      action={
        <div className="relative">
          <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setP(1); }} placeholder={t("search")} className="w-56 rounded-lg border border-gray-300 bg-white py-1.5 pl-8 pr-2 text-sm" />
        </div>
      }
    >
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="text-left px-5 py-3 font-medium">{t("name")}</th>
            <th className="text-left px-4 py-3 font-medium">{t("category")}</th>
            <th className="text-right px-4 py-3 font-medium">{t("price")}</th>
            <th className="text-right px-4 py-3 font-medium">{t("stock")}</th>
            <th className="text-center px-4 py-3 font-medium">{t("status")}</th>
            <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {page?.items.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  {r.images[0] ? <img src={r.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" /> : <div className="w-9 h-9 rounded-lg bg-gray-100" />}
                  <div>
                    <a href={`${STOREFRONT_URL}/${store.slug}/p/${r.slug}`} target="_blank" rel="noreferrer" className="font-medium hover:underline">{r.name}</a>
                    {r.variants.length > 0 && <div className="text-xs text-gray-400">{r.variants.length} {t("variantsLabel")}</div>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">{r.category?.name ?? "—"}</td>
              <td className="px-4 py-3 text-right">{money(r.price)}</td>
              <td className={`px-4 py-3 text-right ${stockOf(r) === 0 ? "text-error-600 font-semibold" : ""}`}>{stockOf(r)}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center justify-center rounded-full w-6 h-6 ${r.isActive ? "bg-success-100 text-success-700" : "bg-gray-100 text-gray-400"}`}>
                  {r.isActive ? <CheckIcon size={13} /> : <XIcon size={13} />}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(r.createdAt)}</td>
            </tr>
          ))}
          {page && page.items.length === 0 && <EmptyRow colSpan={6} kind="products" title={t("emptyProductsTitle")} />}
        </tbody>
      </table>
      {page && <Pagination page={page.page} pages={page.pages} total={page.total} onPage={setP} />}
    </Panel>
  );
}

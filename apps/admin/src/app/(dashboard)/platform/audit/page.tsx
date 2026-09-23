"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { describeEvent, ROLE_TONE } from "@/lib/audit";
import { EmptyRow } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { SearchIcon } from "@/components/icons";

interface Row {
  id: string; action: string; entity: string; actorEmail: string; actorRole: string;
  actor: { id: string; name: string } | null;
  store: { id: string; name: string; slug: string } | null;
  meta: unknown; createdAt: string;
}
interface Page { items: Row[]; total: number; page: number; pages: number; actions: string[] }

/** Owner-panel: audit-jurnal */
export default function PlatformAuditPage() {
  const { t } = useI18n();
  const [page, setPage] = useState<Page | null>(null);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [p, setP] = useState(1);

  useEffect(() => {
    const q = new URLSearchParams({ page: String(p) });
    if (action) q.set("action", action);
    if (search.trim()) q.set("search", search.trim());
    const timer = setTimeout(() => {
      api<Page>(`/admin/audit?${q}`).then(setPage).catch(console.error);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [action, search, p]);

  const label = (a: string) => {
    const key = `action_${a}` as TKey;
    const v = t(key);
    return v === key ? a : v;
  };
  const roleLabel = (r: string) => {
    if (r === "MERCHANT") return t("role_MERCHANT");
    const key = `adminRole_${r}` as TKey;
    const v = t(key);
    return v === key ? r : v;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">{t("audit")}</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">{t("auditHint")}</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setP(1); }} placeholder={t("search")} className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 bg-white" />
        </div>
        <select value={action} onChange={(e) => { setAction(e.target.value); setP(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
          <option value="">{t("allActions")}</option>
          {page?.actions.map((a) => <option key={a} value={a}>{label(a)}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">{t("date")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("actor")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("action")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("store")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("details")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {page?.items.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 align-top">
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{dateTime(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.actor?.name ?? r.actorEmail}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_TONE[r.actorRole] ?? ROLE_TONE.SYSTEM}`}>{roleLabel(r.actorRole)}</span>
                    {r.actor && <span>{r.actorEmail}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium whitespace-nowrap">{label(r.action)}</td>
                <td className="px-4 py-3">
                  {r.store ? (
                    <Link href={`/platform/stores/${r.store.id}`} className="text-primary-600 hover:underline">{r.store.name}</Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 break-words max-w-md">{describeEvent(r.action, r.meta) || <span className="text-gray-300">—</span>}</td>
              </tr>
            ))}
            {page && page.items.length === 0 && <EmptyRow colSpan={5} kind="generic" title={t("noEvents")} />}
          </tbody>
        </table>
        {page && <Pagination page={page.page} pages={page.pages} total={page.total} onPage={setP} />}
      </div>
    </div>
  );
}

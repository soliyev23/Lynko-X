"use client";

import { useI18n } from "@/lib/i18n";
import { tpl } from "@/lib/format";

export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  const { t } = useI18n();
  if (pages <= 1) return null;
  const btn = "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400 disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-gray-500">
      <span>{total} {t("found")}</span>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>{t("prevPage")}</button>
        <span className="tabular-nums">{tpl(t("pageOf"), { p: page, n: pages })}</span>
        <button type="button" className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>{t("nextPage")}</button>
      </div>
    </div>
  );
}

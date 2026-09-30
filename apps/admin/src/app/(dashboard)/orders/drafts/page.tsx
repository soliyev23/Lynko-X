"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money, tpl } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { Badge, ButtonLink } from "@/components/ui";
import { OrdersTabs } from "@/components/OrdersTabs";
import { SectionEmpty } from "@/components/SectionEmpty";
import { EmptyRow } from "@/components/EmptyState";
import { FileEditIcon } from "@/components/icons";

interface DraftRow {
  id: string;
  number: number;
  status: "OPEN" | "COMPLETED";
  customerName: string | null;
  phone: string | null;
  total: number;
  createdAt: string;
  items: { id: string }[];
  order: { id: string; number: number } | null;
}

const FILTERS = ["", "OPEN", "COMPLETED"] as const;

export default function DraftsPage() {
  const { t } = useI18n();
  const [drafts, setDrafts] = useState<DraftRow[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("");

  useEffect(() => {
    setDrafts(null);
    api<DraftRow[]>(`/drafts${filter ? `?status=${filter}` : ""}`)
      .then(setDrafts)
      .catch(console.error);
  }, [filter]);

  const label = (f: (typeof FILTERS)[number]) =>
    f === "OPEN" ? t("draftOpen") : f === "COMPLETED" ? t("draftCompleted") : t("all");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2.5 text-xl font-bold">
          <FileEditIcon size={20} className="text-gray-400" />
          {t("drafts")}
        </h1>
        <ButtonLink href="/orders/drafts/new" variant="primary">
          {t("createDraft")}
        </ButtonLink>
      </div>
      <OrdersTabs />

      {drafts && drafts.length === 0 && !filter ? (
        <SectionEmpty
          kind="drafts"
          title={t("draftsEmptyTitle")}
          text={t("draftsEmptyText")}
          action={
            <ButtonLink href="/orders/drafts/new" variant="secondary">
              {t("createDraft")}
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  filter === f
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-300 bg-white text-gray-600 hover:border-primary-400"
                }`}
              >
                {label(f)}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">{t("date")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("customer")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("items")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("total")}</th>
                  <th className="px-4 py-3 text-center font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drafts?.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/orders/drafts/${d.id}`} className="font-semibold text-primary-600 hover:underline">
                        #D{d.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{dateTime(d.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{d.customerName || "—"}</div>
                      {d.phone && <div className="text-xs text-gray-500">{d.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tpl(t("itemsCount"), { n: d.items.length })}</td>
                    <td className="px-4 py-3 text-right font-medium">{money(d.total)}</td>
                    <td className="px-4 py-3 text-center">
                      {d.status === "COMPLETED" && d.order ? (
                        <Link href={`/orders/${d.order.id}`} className="inline-flex">
                          <Badge tone="success">
                            {t("draftCompleted")} · #{d.order.number}
                          </Badge>
                        </Link>
                      ) : (
                        <Badge tone="primary">{t("draftOpen")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {drafts?.length === 0 && (
                  <EmptyRow colSpan={6} kind="orders" title={t("nothingHere")} />
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

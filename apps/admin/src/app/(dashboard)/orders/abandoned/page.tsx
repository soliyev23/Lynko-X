"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money, tpl } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { Button, buttonClass } from "@/components/ui";
import { OrdersTabs } from "@/components/OrdersTabs";
import { SectionEmpty } from "@/components/SectionEmpty";
import { CartXIcon, CopyIcon, PhoneIcon, TrashIcon, LinkIcon } from "@/components/icons";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001";

interface SessionRow {
  id: string;
  token: string;
  customerName: string | null;
  phone: string;
  address: string | null;
  items: { name: string; variantName: string | null; quantity: number }[];
  subtotal: number;
  recovered: boolean;
  updatedAt: string;
  completedAt: string | null;
  order: { id: string; number: number; total: number } | null;
}

type Status = "abandoned" | "recovered";

export default function AbandonedPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<SessionRow[] | null>(null);
  const [status, setStatus] = useState<Status>("abandoned");
  const [slug, setSlug] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    api<{ slug: string }>("/store").then((s) => setSlug(s.slug)).catch(() => undefined);
  }, []);
  useEffect(() => {
    setRows(null);
    api<SessionRow[]>(`/checkouts?status=${status}`).then(setRows).catch(console.error);
  }, [status]);

  const recoveryLink = (row: SessionRow) => `${STOREFRONT_URL}/${slug}/checkout?recover=${row.token}`;

  async function copy(row: SessionRow) {
    try {
      await navigator.clipboard.writeText(recoveryLink(row));
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(""), 2000);
    } catch {}
  }
  async function remove(row: SessionRow) {
    if (!window.confirm(t("deleteCheckoutConfirm"))) return;
    await api(`/checkouts/${row.id}`, { method: "DELETE" });
    setRows((prev) => prev?.filter((r) => r.id !== row.id) ?? null);
  }

  const summary = (row: SessionRow) => {
    const names = row.items.map((i) => `${i.name}${i.variantName ? ` / ${i.variantName}` : ""} × ${i.quantity}`);
    const shown = names.slice(0, 2).join(", ");
    return names.length > 2 ? `${shown}, ${tpl(t("moreItems"), { n: names.length - 2 })}` : shown;
  };

  const abandoned = status === "abandoned";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2.5 text-xl font-bold">
            <CartXIcon size={20} className="text-gray-400" />
            {t("abandonedCheckouts")}
          </h1>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            aria-label={t("status")}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-primary-500 focus:outline-none"
          >
            <option value="abandoned">{t("statusAbandoned")}</option>
            <option value="recovered">{t("statusRecovered")}</option>
          </select>
        </div>
      </div>
      <OrdersTabs />

      {rows && rows.length === 0 ? (
        <SectionEmpty
          kind="abandoned"
          title={abandoned ? t("abandonedEmptyTitle") : t("recoveredEmptyTitle")}
          text={abandoned ? t("abandonedEmptyText") : t("recoveredEmptyText")}
        >
          {abandoned && (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                <LinkIcon size={16} />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{t("abandonedHowTitle")}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{t("abandonedHowText")}</p>
              </div>
            </div>
          )}
        </SectionEmpty>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t("lastActivity")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("customer")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("cart")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("subtotal")}</th>
                <th className="px-4 py-3 text-right font-medium">{abandoned ? t("actions") : t("order")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows?.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{dateTime(row.completedAt ?? row.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.customerName || "—"}</div>
                    <a href={`tel:${row.phone}`} className="text-xs text-gray-500 hover:text-primary-700">
                      {row.phone}
                    </a>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <div className="truncate">{summary(row)}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{money(row.subtotal)}</td>
                  <td className="px-4 py-3">
                    {abandoned ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => copy(row)} disabled={!slug}>
                          <CopyIcon size={14} />
                          {copiedId === row.id ? t("copied") : t("copyCartLink")}
                        </Button>
                        <a href={`tel:${row.phone}`} className={buttonClass("secondary", "sm")}>
                          <PhoneIcon size={14} />
                          {t("callCustomer")}
                        </a>
                        <button
                          type="button"
                          onClick={() => remove(row)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-error-50 hover:text-error-600"
                          aria-label={t("delete")}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    ) : row.order ? (
                      <div className="text-right">
                        <Link href={`/orders/${row.order.id}`} className="font-semibold text-primary-600 hover:underline">
                          #{row.order.number}
                        </Link>
                        <div className="text-xs text-gray-500">{money(row.order.total)}</div>
                      </div>
                    ) : (
                      <span className="block text-right text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

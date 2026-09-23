"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateOnly, tpl } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import type { SubscriptionInfo } from "@/components/badges";
import { AlertTriangleIcon } from "@/components/icons";

interface StoreBrief {
  id: string; name: string; slug: string; isActive: boolean;
  blockReason: string | null; blockedAt: string | null; createdAt: string;
  owner: { name: string; email: string };
  _count: { products: number; orders: number };
  subscription: SubscriptionInfo;
}
interface Attention {
  trialEnding: StoreBrief[];
  expired: StoreBrief[];
  noOwnProducts: StoreBrief[];
  blocked: StoreBrief[];
}

const SHOW = 5;

/** Owner dashboard: kimga bugun e'tibor berish kerak */
export function AttentionPanel() {
  const { t } = useI18n();
  const [data, setData] = useState<Attention | null>(null);

  useEffect(() => {
    api<Attention>("/admin/attention").then(setData).catch(console.error);
  }, []);

  if (!data) return null;
  const groups: { key: keyof Attention; title: string; tone: string; sub: (s: StoreBrief) => string }[] = [
    { key: "trialEnding", title: t("trialEnding3"), tone: "bg-warning-100 text-warning-700", sub: (s) => tpl(t("daysLeft"), { n: s.subscription.daysLeft ?? 0 }) },
    { key: "expired", title: t("expiredList"), tone: "bg-error-100 text-error-700", sub: (s) => tpl(t("expiredOn"), { d: dateOnly(s.subscription.expiresAt) }) },
    { key: "noOwnProducts", title: t("noOwnProducts"), tone: "bg-info-100 text-info-700", sub: (s) => `${t("registered")}: ${dateOnly(s.createdAt)}` },
    { key: "blocked", title: t("blockedStores"), tone: "bg-gray-100 text-gray-600", sub: (s) => s.blockReason || (s.blockedAt ? dateOnly(s.blockedAt) : "") },
  ];
  const total = groups.reduce((n, g) => n + data[g.key].length, 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangleIcon size={18} className={total ? "text-warning-600" : "text-gray-400"} />
        <h2 className="font-semibold">{t("attention")}</h2>
        {total > 0 && <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700">{total}</span>}
      </div>
      <p className="text-xs text-gray-500 mb-4">{t("attentionHint")}</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {groups.map((g) => {
          const rows = data[g.key];
          return (
            <div key={g.key} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium">{g.title}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rows.length ? g.tone : "bg-gray-100 text-gray-400"}`}>{rows.length}</span>
              </div>
              {rows.length === 0 ? (
                <div className="text-xs text-gray-400 py-2">{t("nothingHere")}</div>
              ) : (
                <ul className="space-y-1.5">
                  {rows.slice(0, SHOW).map((s) => (
                    <li key={s.id} className="text-sm">
                      <Link href={`/platform/stores/${s.id}`} className="font-medium text-primary-600 hover:underline">{s.name}</Link>
                      <div className="text-xs text-gray-500 truncate">{g.sub(s)}</div>
                    </li>
                  ))}
                  {rows.length > SHOW && <li className="text-xs text-gray-400">+{rows.length - SHOW}</li>}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { PaymentBadge, StatusBadge } from "@/components/badges";
import {
  BarChart,
  HBars,
  Meter,
  Panel,
  StatTile,
  longDay,
  pctChange,
  shortDay,
} from "@/components/charts";
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, XIcon } from "@/components/icons";

interface StoreDetail {
  store: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    phone: string | null;
    telegram: string | null;
    logoUrl: string | null;
    theme: string;
    plan: "FREE" | "BASIC" | "PRO";
    isActive: boolean;
    deliveryFee: number;
    createdAt: string;
    telegramConfigured: boolean;
    owner: { id: string; name: string; email: string; createdAt: string };
    _count: { products: number; orders: number; categories: number };
  };
  usage: { plan: string; products: number; limit: number | null };
  analytics: {
    totals: { products: number; orders: number; newOrders: number; revenue: number };
    period: { orders30: number; revenue30: number; ordersPrev30: number; revenuePrev30: number };
    daily: { day: string; orders: number; revenue: number }[];
    statusBreakdown: { status: string; count: number }[];
    topProducts: { productId: string | null; name: string; quantity: number; revenue: number }[];
    lowStock: { productId: string; name: string; stock: number }[];
    recentOrders: {
      id: string; number: number; customerName: string; total: number;
      status: string; paymentStatus: string; createdAt: string;
    }[];
  };
  products: {
    id: string; name: string; slug: string; price: number; stock: number; isActive: boolean;
    images: string[]; createdAt: string; category: { name: string } | null;
    variants: { name: string; stock: number; price: number | null }[];
  }[];
}

const PLANS = ["FREE", "BASIC", "PRO"] as const;
const STATUS_ORDER = ["NEW", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function PlatformStoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useI18n();
  const [data, setData] = useState<StoreDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<StoreDetail>(`/admin/stores/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  async function patch(body: { isActive?: boolean; plan?: string }) {
    setError("");
    try {
      const u = await api<{ plan: StoreDetail["store"]["plan"]; isActive: boolean }>(
        `/admin/stores/${id}`,
        { method: "PATCH", body: JSON.stringify(body) },
      );
      setData((d) => d ? { ...d, store: { ...d.store, plan: u.plan, isActive: u.isActive }, usage: { ...d.usage, plan: u.plan } } : d);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (error && !data) return <div className="text-red-600">{error}</div>;
  if (!data) return <div className="text-gray-400">{t("loading")}</div>;

  const { store, usage, analytics: an, products } = data;
  const stockOf = (p: StoreDetail["products"][number]) =>
    p.variants.length ? p.variants.reduce((s, v) => s + v.stock, 0) : p.stock;

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/platform/stores" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeftIcon size={15} />
        {t("backToStores")}
      </Link>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold">{store.name[0]}</div>
          )}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{store.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${store.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {store.isActive ? t("activeLabel") : t("blocked")}
              </span>
            </div>
            <a href={`http://localhost:3001/${store.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mt-1">
              /{store.slug} <ExternalLinkIcon size={12} />
            </a>
            {store.description && <p className="text-sm text-gray-500 mt-2 max-w-xl">{store.description}</p>}
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm mt-4">
              <div><dt className="inline text-gray-500">{t("owner")}: </dt><dd className="inline font-medium">{store.owner.name}</dd> <span className="text-gray-400">({store.owner.email})</span></div>
              <div><dt className="inline text-gray-500">{t("registered")}: </dt><dd className="inline">{dateTime(store.createdAt)}</dd></div>
              <div><dt className="inline text-gray-500">{t("phone")}: </dt><dd className="inline">{store.phone ?? "—"}</dd></div>
              <div><dt className="inline text-gray-500">{t("theme")}: </dt><dd className="inline capitalize">{store.theme}</dd></div>
              <div><dt className="inline text-gray-500">{t("deliveryFee")}: </dt><dd className="inline">{money(store.deliveryFee)}</dd></div>
              <div className="inline-flex items-center gap-1.5">
                {store.telegramConfigured ? <CheckIcon size={14} className="text-green-600" /> : <XIcon size={14} className="text-gray-400" />}
                <span className={store.telegramConfigured ? "text-green-700" : "text-gray-500"}>
                  {store.telegramConfigured ? t("telegramLinked") : t("telegramNotLinked")}
                </span>
              </div>
            </dl>
          </div>
        </div>
        <div className="flex flex-col gap-3 shrink-0 lg:w-56">
          <label className="block">
            <span className="text-xs font-medium text-gray-500">{t("plan")}</span>
            <select
              value={store.plan}
              onChange={(e) => patch({ plan: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm"
            >
              {PLANS.map((p) => <option key={p} value={p}>{t(`plan_${p}` as TKey)}</option>)}
            </select>
          </label>
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t("planUsage")}</span>
              <span>{usage.products} / {usage.limit ?? t("unlimited")}</span>
            </div>
            <Meter value={usage.products} max={usage.limit ?? Math.max(usage.products, 1)} />
          </div>
          <button
            onClick={() => patch({ isActive: !store.isActive })}
            className={`rounded-lg px-4 py-2 text-sm font-medium border transition ${
              store.isActive
                ? "border-red-200 text-red-700 hover:bg-red-50"
                : "border-green-200 text-green-700 hover:bg-green-50"
            }`}
          >
            {store.isActive ? t("block") : t("activate")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile label={t("totalRevenue")} value={money(an.totals.revenue)} highlight />
        <StatTile label={t("revenue30")} value={money(an.period.revenue30)} delta={pctChange(an.period.revenue30, an.period.revenuePrev30)} deltaLabel={t("vsPrev30")} />
        <StatTile label={t("orders")} value={an.totals.orders} hint={`${an.period.orders30} — ${t("last30")}`} />
        <StatTile label={t("newOrders")} value={an.totals.newOrders} />
        <StatTile label={t("products")} value={an.totals.products} hint={`${store._count.categories} ${t("categories").toLowerCase()}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t("dailyRevenue")} action={<span className="text-xs text-gray-400">{t("last30")}</span>}>
          <BarChart data={an.daily.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.revenue }))} tooltipValue={(p) => money(p.value)} />
        </Panel>
        <Panel title={t("dailyOrders")} action={<span className="text-xs text-gray-400">{t("last30")}</span>}>
          <BarChart data={an.daily.map((d) => ({ label: shortDay(d.day), title: longDay(d.day), value: d.orders }))} format={(v) => String(v)} />
        </Panel>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title={t("topProducts")}>
          <HBars rows={an.topProducts.map((p) => ({ label: p.name, value: p.quantity, sub: money(p.revenue) }))} format={(v) => `${v} ${t("pcs")}`} emptyText={t("noData")} />
        </Panel>
        <Panel title={t("lowStock")} action={<span className="text-xs text-gray-400">{t("lowStockHint")}</span>}>
          {an.lowStock.length === 0 ? (
            <div className="text-sm text-gray-400 py-6 text-center">{t("allGood")}</div>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {an.lowStock.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2 gap-3">
                  <span className="truncate">{p.name}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{p.stock} {t("pcs")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={t("statusBreakdown")}>
          <HBars
            rows={STATUS_ORDER.map((s) => ({ label: t(`status_${s}` as TKey), value: an.statusBreakdown.find((r) => r.status === s)?.count ?? 0 })).filter((r) => r.value > 0)}
            emptyText={t("noData")}
          />
        </Panel>
      </div>

      <Panel title={`${t("products")} (${products.length})`} className="!p-0 overflow-hidden">
        <table className="w-full text-sm -mt-4">
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
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? <img src={p.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" /> : <div className="w-9 h-9 rounded-lg bg-gray-100" />}
                    <div>
                      <a href={`http://localhost:3001/${store.slug}/p/${p.slug}`} target="_blank" className="font-medium hover:underline">{p.name}</a>
                      {p.variants.length > 0 && <div className="text-xs text-gray-400">{p.variants.length} {t("variantsLabel")}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3 text-right">{money(p.price)}</td>
                <td className={`px-4 py-3 text-right ${stockOf(p) === 0 ? "text-red-600 font-semibold" : ""}`}>{stockOf(p)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center rounded-full w-6 h-6 ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {p.isActive ? <CheckIcon size={13} /> : <XIcon size={13} />}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(p.createdAt)}</td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">{t("empty")}</td></tr>}
          </tbody>
        </table>
      </Panel>

      <Panel title={t("recentOrders")} className="!p-0 overflow-hidden">
        <table className="w-full text-sm -mt-4">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">#</th>
              <th className="text-left px-4 py-3 font-medium">{t("customer")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("total")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("status")}</th>
              <th className="text-center px-4 py-3 font-medium">{t("paymentStatus")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("date")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {an.recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold">#{o.number}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-right font-medium">{money(o.total)}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-center"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(o.createdAt)}</td>
              </tr>
            ))}
            {an.recentOrders.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">{t("empty")}</td></tr>}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

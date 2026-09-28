"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { tpl } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { Alert, Button, ButtonLink } from "@/components/ui";
import { ThemePreview } from "@/components/ThemePreview";
import { THEME_OPTIONS } from "@/lib/themes";
import { CheckIcon, CopyIcon, ExternalLinkIcon, PencilIcon, PlusIcon } from "@/components/icons";

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001";
/** Yangi do'konga avtomatik qo'shiladigan namuna mahsulotlar kategoriyasi */
const SAMPLES_SLUG = "namunalar";

interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  theme: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  brandColor: string | null;
  isActive: boolean;
}
interface Stats {
  products: number;
  orders: number;
  newOrders: number;
  revenue: number;
}
interface ProductRow {
  id: string;
  category: { slug: string } | null;
}
interface Step {
  key: string;
  title: TKey;
  text: TKey;
  action: TKey;
  href?: string;
  done: boolean;
}

type Status = "ready" | "notReady" | "blocked";

/**
 * Sotuvchi paneli: Home. Do'konni ishga tushirish qadamlari va ikkita
 * yo'naltiruvchi kartochka. Ma'lumot: /store, /stats, /products.
 */
export default function HomePage() {
  const { t } = useI18n();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [ownProducts, setOwnProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([api<StoreInfo>("/store"), api<Stats>("/stats"), api<ProductRow[]>("/products")])
      .then(([s, st, products]) => {
        setStore(s);
        setStats(st);
        // Namuna mahsulotlar sotuvchining o'z mahsuloti hisoblanmaydi
        setOwnProducts(products.filter((p) => p.category?.slug !== SAMPLES_SLUG).length);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <Alert tone="error">{error}</Alert>;
  if (!store || !stats) return <HomeSkeleton />;

  const storeUrl = `${STOREFRONT_URL}/${store.slug}`;
  const designDone = store.theme !== "classic" || Boolean(store.brandColor || store.logoUrl || store.bannerUrl);
  const steps: Step[] = [
    { key: "products", title: "step1Title", text: "step1Text", action: "step1Action", href: "/products/new", done: ownProducts > 0 },
    { key: "design", title: "step2Title", text: "step2Text", action: "step2Action", href: "/design", done: designDone },
    { key: "contacts", title: "step3Title", text: "step3Text", action: "step3Action", href: "/settings", done: Boolean(store.phone) },
    { key: "order", title: "step4Title", text: "step4Text", action: "step4Action", done: stats.orders > 0 },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;
  const current = steps.find((s) => !s.done);
  const status: Status = !store.isActive ? "blocked" : ownProducts > 0 && store.phone ? "ready" : "notReady";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard ruxsati yo'q: jim o'tamiz */
    }
  }

  return (
    <div className="space-y-10">
      {/* Holat qatori */}
      <div className="flex items-center justify-between gap-4">
        <StatusPill status={status} />
        <a
          href={storeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
        >
          <span className="truncate">{storeUrl.replace(/^https?:\/\//, "")}</span>
          <ExternalLinkIcon size={14} className="shrink-0" />
        </a>
      </div>

      {/* Sarlavha */}
      <div className="pt-4 text-center">
        <p className="font-display text-2xl font-medium tracking-tight text-gray-500 md:text-3xl">{t("homeWelcome")}</p>
        <h1 className="mt-1 inline-flex max-w-full items-center gap-3 text-3xl font-bold text-gray-900 md:text-4xl">
          <span className="truncate">{tpl(t(allDone ? "homeAllSet" : "homeSetupTitle"), { name: store.name })}</span>
          <Link
            href="/settings"
            aria-label={t("editStoreName")}
            title={t("editStoreName")}
            className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <PencilIcon size={20} />
          </Link>
        </h1>
      </div>

      {/* Ishga tushirish qadamlari */}
      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("setupCardTitle")}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{allDone ? t("setupAllDone") : t("setupCardHint")}</p>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {tpl(t("setupProgress"), { done: doneCount, total: steps.length })}
          </span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary-600 transition-[width] duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <ol className="mt-2 divide-y divide-gray-100">
          {steps.map((s) => {
            const isCurrent = current?.key === s.key;
            return (
              <li key={s.key} className="flex items-start gap-4 py-4">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    s.done ? "bg-primary-600 text-white" : "border-2 border-dashed border-gray-300"
                  }`}
                >
                  {s.done && <CheckIcon size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold ${s.done ? "text-gray-500" : "text-gray-900"}`}>{t(s.title)}</div>
                  {!s.done && <p className="mt-0.5 text-sm text-gray-500">{t(s.text)}</p>}
                </div>
                {s.done ? (
                  <span className="text-xs font-medium text-primary-700">{t("stepDone")}</span>
                ) : s.href ? (
                  <ButtonLink href={s.href} size="sm" variant={isCurrent ? "primary" : "secondary"}>
                    {t(s.action)}
                  </ButtonLink>
                ) : (
                  <Button size="sm" variant={isCurrent ? "primary" : "secondary"} onClick={copyLink}>
                    <CopyIcon size={14} />
                    {copied ? t("copied") : t(s.action)}
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Yo'naltiruvchi kartochkalar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FeatureCard
          title={t("homeCard1Title")}
          text={t("homeCard1Text")}
          action={
            <ButtonLink href="/products/new" variant="secondary">
              {t("step1Action")}
            </ButtonLink>
          }
        >
          <ProductsIllustration />
        </FeatureCard>
        <FeatureCard
          title={t("homeCard2Title")}
          text={t("homeCard2Text")}
          action={
            <ButtonLink href="/design" variant="secondary">
              {t("step2Action")}
            </ButtonLink>
          }
        >
          <ThemesIllustration brandColor={store.brandColor} />
        </FeatureCard>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const { t } = useI18n();
  const dot = status === "ready" ? "bg-success-500" : status === "blocked" ? "bg-error-500" : "bg-gray-400";
  const label = status === "ready" ? t("readyToSell") : status === "blocked" ? t("storeBlockedStatus") : t("notReadyToSell");
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
      <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function FeatureCard({ title, text, action, children }: { title: string; text: string; action: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-gray-500">{text}</p>
      <div className="my-6 flex-1">{children}</div>
      <div>{action}</div>
    </section>
  );
}

/** Ikki namuna mahsulot va o'rtada "qo'shish" joyi */
function ProductsIllustration() {
  const tile = "absolute top-8 h-40 w-32 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-gray-200";
  return (
    <div className="relative mx-auto h-56 w-full max-w-md select-none">
      <div className={`${tile} left-[6%] -rotate-6`}>
        <img src="/samples/tshirt.svg" alt="" className="h-full w-full object-contain" />
      </div>
      <div className="absolute left-1/2 top-6 z-10 flex h-44 w-36 -translate-x-1/2 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/80 text-gray-400 backdrop-blur-sm">
        <PlusIcon size={28} />
      </div>
      <div className={`${tile} right-[6%] rotate-6`}>
        <img src="/samples/sneaker.svg" alt="" className="h-full w-full object-contain" />
      </div>
    </div>
  );
}

/** Uchta shablon ko'rinishi: o'rtadagisi sotuvchining brend rangida */
function ThemesIllustration({ brandColor }: { brandColor: string | null }) {
  const picks = (["classic", "bold", "elegant"] as const).map((id) => THEME_OPTIONS.find((th) => th.id === id)!);
  const pos = ["left-[2%] top-12 -rotate-6", "z-10 top-4 shadow-xl", "right-[2%] top-12 rotate-6"];
  return (
    <div className="relative mx-auto h-56 w-full max-w-md select-none">
      {picks.map((theme, i) => (
        <div
          key={theme.id}
          className={`absolute w-44 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-gray-200 ${pos[i]} ${
            i === 1 ? "left-1/2 -translate-x-1/2" : ""
          }`}
        >
          <ThemePreview theme={theme} brandColor={i === 1 ? brandColor : undefined} />
        </div>
      ))}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="h-5 w-40 rounded bg-gray-200" />
      <div className="flex flex-col items-center gap-3 pt-4">
        <div className="h-7 w-64 rounded bg-gray-200" />
        <div className="h-9 w-96 max-w-full rounded bg-gray-200" />
      </div>
      <div className="mx-auto h-72 w-full max-w-3xl rounded-2xl bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-2xl bg-gray-200" />
        <div className="h-96 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}

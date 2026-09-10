"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { THEME_OPTIONS, type ThemeOption } from "@/lib/themes";
import { ImageUploader } from "@/components/ImageUploader";
import { ThemePreview } from "@/components/ThemePreview";
import { CheckIcon, ExternalLinkIcon } from "@/components/icons";

interface StoreDesign {
  slug: string;
  theme: ThemeOption["id"];
  bannerUrl: string;
}

function DesignPageInner() {
  const { t } = useI18n();
  const welcome = useSearchParams().get("welcome") === "1";
  const [store, setStore] = useState<StoreDesign | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<any>("/store").then((s) =>
      setStore({
        slug: s.slug,
        theme: s.theme ?? "classic",
        bannerUrl: s.bannerUrl ?? "",
      }),
    );
  }, []);

  async function save(patch: Partial<Pick<StoreDesign, "theme" | "bannerUrl">>) {
    if (!store) return;
    setSaving(patch.theme ?? "banner");
    setError("");
    try {
      await api("/store", { method: "PATCH", body: JSON.stringify(patch) });
      setStore((s) => (s ? { ...s, ...patch } : s));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (!store) return <div className="text-gray-400">{t("loading")}</div>;

  return (
    <div className="max-w-5xl">
      {welcome && (
        <div className="bg-indigo-600 text-white rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold">{t("welcomeTitle")}</h2>
          <p className="text-indigo-100 mt-1">{t("welcomeText")}</p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("design")}</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl">
            {t("templateHint")}
          </p>
        </div>
        <a
          href={`http://localhost:3001/${store.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-indigo-400 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium bg-white whitespace-nowrap"
        >
          <ExternalLinkIcon size={15} />
          {t("previewStore")}
        </a>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <h2 className="font-semibold mb-3">{t("chooseTemplate")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {THEME_OPTIONS.map((opt) => {
          const active = store.theme === opt.id;
          const busy = saving === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => !active && save({ theme: opt.id })}
              disabled={saving !== null}
              className={`text-left rounded-2xl border-2 p-3 bg-white transition ${
                active
                  ? "border-indigo-600 ring-4 ring-indigo-100"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <ThemePreview theme={opt} />
              <div className="flex items-start justify-between gap-2 mt-3">
                <div>
                  <div className="font-semibold">{opt.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.tagline}</div>
                  <div className="text-xs text-gray-400 mt-1.5">
                    {t("suitsFor")}: {opt.suits} · {t("font")}: {opt.font}
                  </div>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {active && <CheckIcon size={12} />}
                  {busy ? t("saving") : active ? t("selected") : t("select")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <h2 className="font-semibold mb-1">{t("banner")}</h2>
      <p className="text-xs text-gray-500 mb-3">{t("bannerHint")}</p>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8">
        {store.bannerUrl && (
          <img
            src={store.bannerUrl}
            alt=""
            className="w-full aspect-[8/3] object-cover rounded-xl mb-4 bg-gray-100"
          />
        )}
        <ImageUploader
          single
          images={store.bannerUrl ? [store.bannerUrl] : []}
          onChange={(images) => save({ bannerUrl: images[0] ?? "" })}
        />
      </div>

      {welcome && (
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-5 py-2.5"
        >
          {t("nextAddProducts")}
        </Link>
      )}
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense fallback={null}>
      <DesignPageInner />
    </Suspense>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { THEME_OPTIONS, type ThemeOption } from "@/lib/themes";
import { ImageUploader } from "@/components/ImageUploader";
import { ThemePreview } from "@/components/ThemePreview";
import { CheckIcon, ExternalLinkIcon, XIcon } from "@/components/icons";

interface StoreDesign {
  slug: string;
  theme: ThemeOption["id"];
  bannerUrl: string;
  brandColor: string; // "" = shablonning standart rangi
}

/** Tez tanlash uchun brend ranglari. Sotuvchi istalgan #rrggbb rangni ham kirita oladi. */
const BRAND_PRESETS = [
  "#1f2937", "#0e7c7b", "#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#0891b2",
];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

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
        brandColor: s.brandColor ?? "",
      }),
    );
  }, []);

  const [customColor, setCustomColor] = useState("");

  async function save(patch: Partial<Pick<StoreDesign, "theme" | "bannerUrl" | "brandColor">>) {
    if (!store) return;
    setSaving(patch.theme ?? (patch.brandColor !== undefined ? "brand" : "banner"));
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
    <div className="max-w-5xl mx-auto">
      {welcome && (
        <div className="bg-primary-50 border border-primary-200 text-primary-900 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold">{t("welcomeTitle")}</h2>
          <p className="text-primary-700 mt-1">{t("welcomeText")}</p>
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
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-primary-400 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium bg-white whitespace-nowrap"
        >
          <ExternalLinkIcon size={15} />
          {t("previewStore")}
        </a>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3 mb-4">
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
                  ? "border-primary-600 ring-4 ring-primary-100"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <ThemePreview theme={opt} brandColor={store.brandColor} />
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
                      ? "bg-primary-600 text-white"
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

      <h2 className="font-semibold mb-1">{t("brandColor")}</h2>
      <p className="text-xs text-gray-500 mb-3">{t("brandColorHint")}</p>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => save({ brandColor: "" })}
            aria-pressed={!store.brandColor}
            className={`h-9 rounded-lg border px-3 text-sm font-medium transition ${
              !store.brandColor
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            {t("brandDefault")}
          </button>
          {BRAND_PRESETS.map((c) => {
            const active = store.brandColor.toLowerCase() === c;
            return (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={c}
                aria-pressed={active}
                onClick={() => save({ brandColor: c })}
                className={`h-9 w-9 rounded-full border-2 transition ${active ? "border-gray-900 scale-110" : "border-white ring-1 ring-gray-300 hover:scale-105"}`}
                style={{ backgroundColor: c }}
              >
                {active && <CheckIcon size={16} className="mx-auto text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
        <form
          className="mt-4 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (HEX_RE.test(customColor)) save({ brandColor: customColor.toLowerCase() });
          }}
        >
          <label className="text-sm text-gray-600" htmlFor="brand-hex">
            {t("customColor")}
          </label>
          <input
            id="brand-hex"
            type="color"
            value={HEX_RE.test(customColor) ? customColor : store.brandColor || "#1f2937"}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-0.5"
          />
          <input
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value.trim())}
            placeholder="#0e7c7b"
            maxLength={7}
            className="h-9 w-32 rounded-lg border border-gray-300 px-3 font-mono text-sm focus:border-primary-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!HEX_RE.test(customColor) || saving === "brand"}
            className="h-9 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:border-gray-400 disabled:opacity-50"
          >
            {saving === "brand" ? t("saving") : t("apply")}
          </button>
        </form>
      </div>

      <h2 className="font-semibold mb-1">{t("banner")}</h2>
      <p className="text-xs text-gray-500 mb-3">{t("bannerHint")}</p>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8">
        {store.bannerUrl && (
          <div className="relative mb-4">
            <img
              src={store.bannerUrl}
              alt=""
              className="w-full aspect-[8/3] object-cover rounded-xl bg-gray-100"
            />
            <button
              type="button"
              onClick={() => save({ bannerUrl: "" })}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:text-error-600 hover:border-error-300"
            >
              <XIcon size={13} />
              {t("delete")}
            </button>
          </div>
        )}
        <ImageUploader
          single
          images={[]}
          onChange={(images) => images[0] && save({ bannerUrl: images[0] })}
        />
      </div>

      {welcome && (
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-5 py-2.5"
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

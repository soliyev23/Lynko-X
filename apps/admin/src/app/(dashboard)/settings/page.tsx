"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ImageUploader } from "@/components/ImageUploader";

interface StoreSettings {
  name: string;
  slug: string;
  description: string;
  phone: string;
  telegram: string;
  logoUrl: string;
  deliveryFee: string;
}

export default function SettingsPage() {
  const { t } = useI18n();
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<any>("/store").then((s) =>
      setForm({
        name: s.name ?? "",
        slug: s.slug,
        description: s.description ?? "",
        phone: s.phone ?? "",
        telegram: s.telegram ?? "",
        logoUrl: s.logoUrl ?? "",
        deliveryFee: String(s.deliveryFee ?? 0),
      }),
    );
  }, []);

  function set<K extends keyof StoreSettings>(key: K, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await api("/store", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          phone: form.phone,
          telegram: form.telegram,
          logoUrl: form.logoUrl,
          deliveryFee: Number(form.deliveryFee) || 0,
        }),
      });
      setMessage(t("saved"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!form) return <div className="text-gray-400">{t("loading")}</div>;

  const input =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{t("settings")}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {t("viewStore")}:{" "}
        <a
          href={`http://localhost:3001/${form.slug}`}
          target="_blank"
          className="text-indigo-600 font-medium"
        >
          localhost:3001/{form.slug}
        </a>
      </p>
      <form onSubmit={submit} className="space-y-4">
        {message && (
          <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t("storeName")}
          </span>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t("storeDescription")}
          </span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={input}
          />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("phone")}
            </span>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+998 90 123 45 67"
              className={input}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("telegram")}
            </span>
            <input
              value={form.telegram}
              onChange={(e) => set("telegram", e.target.value)}
              placeholder="mening_dokonim"
              className={input}
            />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">
              {t("deliveryFee")}
            </span>
            <input
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => set("deliveryFee", e.target.value)}
              className={input}
            />
          </label>
          <div className="block">
            <span className="text-sm font-medium text-gray-700 block mb-2">
              {t("logoUrl")}
            </span>
            <ImageUploader
              single
              images={form.logoUrl ? [form.logoUrl] : []}
              onChange={(images) => set("logoUrl", images[0] ?? "")}
            />
          </div>
        </div>
        <button
          disabled={busy}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5"
        >
          {busy ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}

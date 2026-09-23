"use client";

import { Logo } from "@/components/Logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function RegisterPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    storeSlug: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(res.token);
      router.push("/design?welcome=1");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const fields: {
    key: keyof typeof form;
    label: string;
    type?: string;
    placeholder?: string;
  }[] = [
    { key: "name", label: t("yourName") },
    { key: "email", label: t("email"), type: "email" },
    { key: "password", label: t("password"), type: "password" },
    { key: "storeName", label: t("storeName") },
    { key: "storeSlug", label: t("storeSlug"), placeholder: "mening-dokonim" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <Logo size={36} textClassName="text-2xl" />
          </div>
          <div className="text-gray-500 mt-1">{t("createStore")}</div>
        </div>
        {error && (
          <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-medium text-gray-700">{f.label}</span>
            <input
              type={f.type ?? "text"}
              required
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={(e) =>
                set(
                  f.key,
                  f.key === "storeSlug"
                    ? e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                    : e.target.value,
                )
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
        ))}
        {form.storeSlug && (
          <p className="text-xs text-gray-500">
            Do'kon manzili: <b>localhost:3001/{form.storeSlug}</b>
          </p>
        )}
        <button
          disabled={busy}
          className="w-full bg-accent-500 hover:bg-accent-400 disabled:opacity-50 text-gray-900 font-medium rounded-lg py-2.5 transition active:bg-accent-600 shadow-md shadow-accent-500/25"
        >
          {busy ? "..." : t("register")}
        </button>
        <p className="text-sm text-center text-gray-500">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-primary-600 font-medium">
            {t("login")}
          </Link>
        </p>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-indigo-600">LYNKO-X</div>
          <div className="text-gray-500 mt-1">{t("login")}</div>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium text-gray-700">{t("email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t("password")}
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <button
          disabled={busy}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition"
        >
          {busy ? "..." : t("login")}
        </button>
        <p className="text-sm text-center text-gray-500">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-indigo-600 font-medium">
            {t("register")}
          </Link>
        </p>
      </form>
    </div>
  );
}

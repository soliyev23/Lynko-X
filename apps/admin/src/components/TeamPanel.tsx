"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateOnly } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { can, useAdmin, type AdminRole } from "@/lib/admin-context";
import { ROLE_TONE } from "@/lib/audit";
import { Button, Input } from "@/components/ui";
import { TrashIcon } from "@/components/icons";

interface AdminRow { id: string; name: string; email: string; adminRole: AdminRole | null; createdAt: string }
const ROLES: AdminRole[] = ["OWNER", "FINANCE", "SUPPORT"];

/** Owner-panel: LYNKO-X jamoasi. Bosh admin qo'shadi, huquqini o'zgartiradi, olib tashlaydi. */
export function TeamPanel() {
  const { t } = useI18n();
  const me = useAdmin();
  const owner = can(me?.adminRole, "team");
  const [rows, setRows] = useState<AdminRow[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", adminRole: "SUPPORT" as AdminRole });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<AdminRow[]>("/admin/admins").then(setRows).catch(console.error);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await api<AdminRow>("/admin/admins", { method: "POST", body: JSON.stringify(form) });
      setRows((r) => [...(r ?? []), created]);
      setForm({ name: "", email: "", password: "", adminRole: "SUPPORT" });
      setShowForm(false);
      setMessage(t("adminAdded"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id: string, adminRole: AdminRole) {
    setError("");
    try {
      const u = await api<AdminRow>(`/admin/admins/${id}`, { method: "PATCH", body: JSON.stringify({ adminRole }) });
      setRows((r) => r?.map((a) => (a.id === id ? u : a)) ?? r);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("confirmRemoveAdmin"))) return;
    setError("");
    try {
      await api(`/admin/admins/${id}`, { method: "DELETE" });
      setRows((r) => r?.filter((a) => a.id !== id) ?? r);
    } catch (err: any) {
      setError(err.message);
    }
  }

  const roleLabel = (r: AdminRole | null) => t(`adminRole_${r ?? "SUPPORT"}` as TKey);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div>
          <h2 className="font-semibold">{t("team")}</h2>
          <p className="text-xs text-gray-500">{t("teamHint")}</p>
        </div>
        {owner && !showForm && <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>{t("addAdmin")}</Button>}
      </div>
      {error && <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3 mb-3">{error}</div>}
      {message && <div className="bg-success-50 text-success-700 text-sm rounded-lg p-3 mb-3">{message}</div>}

      {showForm && (
        <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <Input id="admin-name" placeholder={t("name")} required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input id="admin-email" type="email" placeholder="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input id="admin-password" type="password" placeholder={t("password")} required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.adminRole} onChange={(e) => setForm({ ...form, adminRole: e.target.value as AdminRole })} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? t("saving") : t("save")}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>{t("cancel")}</Button>
          </div>
          <p className="sm:col-span-2 lg:col-span-5 text-xs text-gray-500">
            {ROLES.map((r) => `${roleLabel(r)}: ${t(`adminRoleHint_${r}` as TKey)}`).join(" · ")}
          </p>
        </form>
      )}

      <ul className="divide-y divide-gray-100">
        {rows?.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{a.name}{a.id === me?.id && <span className="text-gray-400"> ({t("you")})</span>}</div>
              <div className="text-xs text-gray-500">{a.email} · {dateOnly(a.createdAt)}</div>
            </div>
            {owner && a.id !== me?.id ? (
              <select value={a.adminRole ?? "SUPPORT"} onChange={(e) => changeRole(a.id, e.target.value as AdminRole)} className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs">
                {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
              </select>
            ) : (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_TONE[a.adminRole ?? "SUPPORT"]}`}>{roleLabel(a.adminRole)}</span>
            )}
            {owner && a.id !== me?.id && (
              <button type="button" onClick={() => remove(a.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600" aria-label={t("removeAdmin")}>
                <TrashIcon size={15} />
              </button>
            )}
          </li>
        ))}
        {rows?.length === 0 && <li className="py-4 text-sm text-gray-400">{t("nothingHere")}</li>}
      </ul>
    </section>
  );
}

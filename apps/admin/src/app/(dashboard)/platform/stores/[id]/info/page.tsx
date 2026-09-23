"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { dateOnly, dateTime, money } from "@/lib/format";
import { useI18n, type TKey } from "@/lib/i18n";
import { useAdmin } from "@/lib/admin-context";
import { describeEvent, ROLE_TONE } from "@/lib/audit";
import { useStoreDetail, type StoreNote } from "@/lib/store-context";
import { Panel } from "@/components/charts";
import { CheckIcon, HistoryIcon, MessageIcon, TrashIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui";

interface EventRow {
  id: string; action: string; actorEmail: string; actorRole: string;
  actor: { id: string; name: string } | null; meta: unknown; createdAt: string;
}

/** Do'kon: kontaktlar, ichki izohlar, voqealar tarixi */
export default function PlatformStoreInfoPage() {
  const { t } = useI18n();
  const me = useAdmin();
  const { data, setData } = useStoreDetail();
  const { store, notes } = data;
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<EventRow[]>(`/admin/stores/${store.id}/events`).then(setEvents).catch(console.error);
  }, [store.id, notes.length, store.isActive, store.plan]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const note = await api<StoreNote>(`/admin/stores/${store.id}/notes`, { method: "POST", body: JSON.stringify({ text }) });
      setData((d) => ({ ...d, notes: [note, ...d.notes] }));
      setText("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeNote(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await api(`/admin/stores/${store.id}/notes/${id}`, { method: "DELETE" });
      setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  const actionLabel = (a: string) => {
    const key = `action_${a}` as TKey;
    const v = t(key);
    return v === key ? a : v;
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3">{error}</div>}
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title={t("contacts")}>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt className="text-gray-500">{t("owner")}</dt><dd className="font-medium">{store.owner.name}</dd><dd className="text-gray-500">{store.owner.email}</dd></div>
            <div><dt className="text-gray-500">{t("phone")}</dt><dd className="font-medium">{store.phone || "—"}</dd></div>
            <div><dt className="text-gray-500">Telegram</dt><dd className="font-medium">{store.telegram ? `@${store.telegram.replace(/^@/, "")}` : "—"}</dd></div>
            <div><dt className="text-gray-500">{t("registered")}</dt><dd>{dateTime(store.createdAt)}</dd></div>
            <div><dt className="text-gray-500">{t("theme")}</dt><dd className="capitalize">{store.theme}</dd></div>
            <div><dt className="text-gray-500">{t("deliveryFee")}</dt><dd>{money(store.deliveryFee)}</dd></div>
            <div className="sm:col-span-2 inline-flex items-center gap-1.5">
              {store.telegramConfigured ? <CheckIcon size={14} className="text-success-600" /> : <XIcon size={14} className="text-gray-400" />}
              <span className={store.telegramConfigured ? "text-success-700" : "text-gray-500"}>{store.telegramConfigured ? t("telegramLinked") : t("telegramNotLinked")}</span>
            </div>
            {store.description && <div className="sm:col-span-2"><dt className="text-gray-500">{t("storeDescription")}</dt><dd>{store.description}</dd></div>}
            {!store.isActive && (
              <div className="sm:col-span-2 rounded-lg bg-error-50 border border-error-200 px-3 py-2 text-error-800">
                <dt className="text-xs font-medium">{t("blockReason")}</dt>
                <dd>{store.blockReason || "—"}</dd>
                {store.blockedAt && <dd className="text-xs text-error-600 mt-0.5">{t("blockedAt")}: {dateTime(store.blockedAt)}</dd>}
              </div>
            )}
          </dl>
        </Panel>

        <Panel title={t("notes")} action={<span className="text-xs text-gray-400">{t("notesHint")}</span>}>
          <form onSubmit={addNote} className="flex flex-col gap-2 mb-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("notePlaceholder")}
              rows={2}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={busy || !text.trim()}>{t("addNote")}</Button>
            </div>
          </form>
          {notes.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-3"><MessageIcon size={16} /> {t("noNotes")}</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notes.map((n) => (
                <li key={n.id} className="py-3 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm whitespace-pre-wrap break-words">{n.text}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {n.author?.name ?? "—"}{n.author?.id === me?.id ? ` (${t("you")})` : ""} · {dateTime(n.createdAt)}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeNote(n.id)} className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600" aria-label={t("delete")}>
                    <TrashIcon size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title={t("events")} action={<HistoryIcon size={16} className="text-gray-400" />}>
        {!events ? (
          <div className="text-sm text-gray-400">{t("loading")}</div>
        ) : events.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">{t("noEvents")}</div>
        ) : (
          <ol className="relative border-l border-gray-200 ml-2 space-y-4">
            {events.map((e) => {
              const detail = describeEvent(e.action, e.meta);
              return (
                <li key={e.id} className="pl-5">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-500 ring-4 ring-white" />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-medium">{actionLabel(e.action)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_TONE[e.actorRole] ?? ROLE_TONE.SYSTEM}`}>
                      {e.actorRole === "MERCHANT" ? t("role_MERCHANT") : (t(`adminRole_${e.actorRole}` as TKey) === `adminRole_${e.actorRole}` ? e.actorRole : t(`adminRole_${e.actorRole}` as TKey))}
                    </span>
                    <span className="text-gray-500">{e.actor?.name ?? e.actorEmail}</span>
                    <span className="text-gray-400 text-xs">{dateTime(e.createdAt)}</span>
                  </div>
                  {detail && <div className="mt-0.5 text-sm text-gray-600 break-words">{detail}</div>}
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </div>
  );
}

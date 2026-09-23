import { dateOnly, money } from "@/lib/format";

/** Jurnal yozuvining qisqa tafsiloti (meta'dan) */
export function describeEvent(action: string, meta: unknown): string {
  const m = (meta ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (v == null ? "—" : String(v));
  switch (action) {
    case "store.registered":
      return m.slug ? `${str(m.name)} · /${str(m.slug)}` : "";
    case "plan.changed":
      return `${str(m.from)} → ${str(m.to)}`;
    case "expiry.changed":
      return `${m.from ? dateOnly(String(m.from)) : "—"} → ${m.to ? dateOnly(String(m.to)) : "—"}`;
    case "trial.changed":
      return m.to ? "sinov: ha" : "sinov: yo'q";
    case "store.blocked":
      return m.reason ? str(m.reason) : "";
    case "payment.added":
      return `${str(m.plan)} · ${money(Number(m.amount ?? 0))} · ${str(m.months)} oy · ${str(m.method)}`;
    case "payment.deleted":
      return `${str(m.plan)} · ${money(Number(m.amount ?? 0))}`;
    case "note.added":
      return str(m.preview);
    case "admin.created":
      return `${str(m.email)} · ${str(m.adminRole)}`;
    case "admin.role_changed":
      return `${str(m.email)}: ${str(m.from)} → ${str(m.to)}`;
    case "admin.removed":
      return str(m.email);
    default:
      return Object.keys(m).length ? JSON.stringify(m) : "";
  }
}

export const ROLE_TONE: Record<string, string> = {
  OWNER: "bg-primary-50 text-primary-700",
  FINANCE: "bg-warning-100 text-warning-700",
  SUPPORT: "bg-info-100 text-info-700",
  MERCHANT: "bg-gray-100 text-gray-600",
  SYSTEM: "bg-gray-100 text-gray-600",
};

export function money(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
}

export function dateTime(value: string | Date): string {
  return new Date(value).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateOnly(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "{n} kun qoldi" kabi matnlardagi joy tutuvchilarni to'ldiradi. */
export function tpl(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** "2026-09" -> "09.2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${m}.${y}`;
}

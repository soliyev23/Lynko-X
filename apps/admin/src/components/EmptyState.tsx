"use client";

import type { ReactNode } from "react";

/**
 * Bo'sh holat: kichik chiziqli illyustratsiya, sarlavha, izoh va keyingi qadam.
 * Jadval ichida ishlatilganda <tr><td colSpan> bilan o'raladi (EmptyRow).
 */
export type EmptyKind = "products" | "orders" | "stores" | "users" | "generic";

function Art({ kind }: { kind: EmptyKind }) {
  const common = {
    width: 72,
    height: 56,
    viewBox: "0 0 72 56",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    case "products":
      return (
        <svg {...common}>
          <path d="M14 22l22-10 22 10v20L36 52 14 42z" className="fill-primary-50 dark:fill-primary-50" />
          <path d="M14 22l22 10 22-10M36 32v20" />
          <path d="M25 17l22 10" className="text-primary-500" />
          <circle cx="58" cy="12" r="5" className="text-accent-500" />
          <path d="M58 9.5v5M55.5 12h5" className="text-accent-500" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common}>
          <path d="M10 12h8l6 26h28l6-18H22" />
          <circle cx="28" cy="46" r="3" />
          <circle cx="48" cy="46" r="3" />
          <path d="M30 26h16M32 32h12" className="text-primary-500" />
          <path d="M54 8c4 0 6 2 6 5s-3 5-6 5" className="text-accent-500" />
        </svg>
      );
    case "stores":
      return (
        <svg {...common}>
          <path d="M14 22h44v26H14z" className="fill-primary-50" />
          <path d="M10 22l6-12h40l6 12" />
          <path d="M10 22c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6c0 4 3 6 6 6s6-2 6-6" className="text-primary-500" />
          <path d="M30 48V36h12v12" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="28" cy="20" r="8" />
          <path d="M12 48c0-9 7-14 16-14s16 5 16 14" />
          <circle cx="50" cy="22" r="6" className="text-primary-500" />
          <path d="M44 46c1-6 5-10 12-10 4 0 7 2 9 4" className="text-primary-500" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="12" y="10" width="48" height="36" rx="6" className="fill-primary-50" />
          <path d="M22 24h28M22 32h18" className="text-primary-500" />
          <circle cx="54" cy="44" r="7" className="fill-white dark:fill-gray-50" />
          <path d="M54 41v6M51 44h6" className="text-accent-500" />
        </svg>
      );
  }
}

export function EmptyState({
  kind = "generic",
  title,
  hint,
  action,
  className = "",
}: {
  kind?: EmptyKind;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <div className="mb-4 text-gray-300 dark:text-gray-500">
        <Art kind={kind} />
      </div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-gray-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Jadval qatori sifatida bo'sh holat */
export function EmptyRow(props: Parameters<typeof EmptyState>[0] & { colSpan: number }) {
  const { colSpan, ...rest } = props;
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <EmptyState {...rest} />
      </td>
    </tr>
  );
}

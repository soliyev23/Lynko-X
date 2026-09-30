"use client";

import { useId, type ReactNode } from "react";

/**
 * Bo'limning katta bo'sh holati: illyustratsiya, sarlavha, izoh va harakat.
 * Ranglar faqat tokenlardan (fill-primary-*, fill-gray-*), qorong'i rejimda ham mos.
 */
export type SectionEmptyKind = "orders" | "drafts" | "abandoned";

function Art({ kind }: { kind: SectionEmptyKind }) {
  const clip = useId();
  if (kind === "abandoned") {
    return (
      <svg width="176" height="176" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="88" className="fill-gray-100" />
        <rect x="86" y="48" width="26" height="26" rx="3" className="fill-gray-300" />
        <rect x="114" y="62" width="22" height="22" rx="3" className="fill-gray-400" />
        <path
          d="M40 62h18l14 58h62l12-42H66"
          className="stroke-primary-600"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="78" cy="140" r="7" className="fill-primary-600" />
        <circle cx="128" cy="140" r="7" className="fill-primary-600" />
        <circle cx="152" cy="52" r="24" className="fill-error-400" />
        <path d="M143 43l18 18M161 43l-18 18" className="stroke-white" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }
  const draft = kind === "drafts";
  return (
    <svg width="176" height="176" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <circle cx="100" cy="100" r="88" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="88" className="fill-gray-100" />
      <path d="M60 18h58l22 22v122H60z" className="fill-surface-card" />
      <path d="M118 18v22h22z" className="fill-gray-200" />
      <rect x="72" y="52" width="36" height="36" rx="4" className={draft ? "fill-accent-100" : "fill-primary-100"} />
      {draft ? (
        <path d="M82 60l4-3h8l4 3 3 5-4 3v14H83V68l-4-3z" className="fill-accent-500" />
      ) : (
        <path d="M84 62h12l4 12-3 12H83l-3-12z" className="fill-primary-500" />
      )}
      <rect x="116" y="58" width="14" height="4" rx="2" className="fill-gray-300" />
      <rect x="116" y="70" width="12" height="4" rx="2" className="fill-gray-300" />
      <rect x="72" y="100" width="56" height="4" rx="2" className="fill-gray-300" />
      <rect x="72" y="112" width="44" height="4" rx="2" className="fill-gray-200" />
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y="140" width="200" height="60" className="fill-primary-600" />
        <path d="M60 140h80l-6 14H66z" className="fill-primary-800" />
      </g>
    </svg>
  );
}

export function SectionEmpty({
  kind,
  title,
  text,
  action,
  children,
}: {
  kind: SectionEmptyKind;
  title: string;
  text: string;
  action?: ReactNode;
  /** Pastki qism: qo'shimcha maslahat bloki */
  children?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <Art kind={kind} />
        <h2 className="mt-6 text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">{text}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
      {children && <div className="border-t border-gray-100 bg-gray-50 px-8 py-6">{children}</div>}
    </div>
  );
}

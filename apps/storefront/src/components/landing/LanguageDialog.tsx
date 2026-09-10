"use client";

import { useEffect, useRef } from "react";
import { XIcon } from "@/components/icons";
import { FlagRu, FlagUz } from "@/components/flags";
import { LANGUAGES, type Locale } from "@/lib/landing-content";

const FLAGS: Record<Locale, (p: { width?: number }) => React.JSX.Element> = {
  uz: FlagUz,
  ru: FlagRu,
};

interface Props {
  open: boolean;
  locale: Locale;
  title: string;
  closeLabel: string;
  onClose: () => void;
  onSelect: (l: Locale) => void;
}

// "Sayt tili" oynasi: mobilda pastdan chiqadigan panel, keng ekranda markazdagi modal
export default function LanguageDialog({ open, locale, title, closeLabel, onClose, onSelect }: Props) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    selectedRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-dialog-title"
        className="relative w-full sm:max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="lang-dialog-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="w-9 h-9 -mr-2 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div role="radiogroup" aria-labelledby="lang-dialog-title" className="space-y-3">
          {LANGUAGES.map((l) => {
            const selected = l.code === locale;
            const Flag = FLAGS[l.code];
            return (
              <button
                key={l.code}
                ref={selected ? selectedRef : undefined}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(l.code)}
                className={`w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left text-base sm:text-lg font-medium transition ${
                  selected
                    ? "border-emerald-600 dark:border-emerald-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected ? "border-emerald-600 dark:border-emerald-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {selected && <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />}
                </span>
                <Flag width={30} />
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

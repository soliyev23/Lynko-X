"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, XIcon } from "@/components/icons";
import { FlagRu, FlagUz } from "@/components/flags";
import { LANGUAGES, type Locale } from "@/lib/landing-content";

const FLAGS: Record<Locale, (p: { width?: number }) => React.JSX.Element> = {
  uz: FlagUz,
  ru: FlagRu,
};

interface Props {
  locale: Locale;
  title: string;
  closeLabel: string;
  onSelect: (l: Locale) => void;
}

// Header'dagi til tugmasi + uning ostida ochiladigan "Sayt tili" paneli
export default function LanguageMenu({ locale, title, closeLabel, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    // Panel tashqarisi bosilsa yopiladi (tugmaning o'zi root ichida, shuning uchun toggle buzilmaydi)
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    selectedRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={title}
        className={`inline-flex items-center gap-1 h-9 rounded-lg border pl-3 pr-2 text-sm font-semibold uppercase transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          open
            ? "border-primary-500 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40"
            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary-500 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40"
        }`}
      >
        {locale}
        <ChevronDownIcon
          size={15}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="lp-pop fixed left-4 right-4 top-[4.5rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 z-50 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl shadow-gray-900/10 dark:shadow-black/50 p-3"
        >
          <div className="flex items-center justify-between mb-2 pl-1">
            <div className="text-sm font-semibold">{title}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={closeLabel}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 transition"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div role="radiogroup" aria-label={title} className="space-y-2">
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
                  onClick={() => {
                    setOpen(false);
                    onSelect(l.code);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    selected
                      ? "border-primary-600 dark:border-primary-500 bg-primary-50/60 dark:bg-primary-950/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span
                    className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selected ? "border-primary-600 dark:border-primary-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-500" />}
                  </span>
                  <Flag width={26} />
                  <span>{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

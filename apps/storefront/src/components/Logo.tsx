// LYNKO-X logotipi: "Bog'lanish" belgisi. Ikki qism (sotuvchi va xaridor) bitta nuqtada ulanadi.
// So'z belgisi kichik harfli "lynko-x", Manrope (font-display), "-x" brend rangida.
export function LogoMark({
  size = 30,
  className = "",
  tone = "auto",
}: {
  size?: number;
  className?: string;
  /** "dark": doim qorong'i fon uchun ranglar (masalan, sidebar) */
  tone?: "auto" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      {/* Gorizontal chiziq: xaridor tomoni */}
      <rect x="7" y="17" width="20" height="8" rx="4" className={dark ? "fill-primary-200" : "fill-primary-300 dark:fill-primary-200"} />
      {/* Vertikal chiziq: sotuvchi tomoni */}
      <rect x="7" y="3" width="8" height="22" rx="4" className={dark ? "fill-primary-400" : "fill-primary-500 dark:fill-primary-400"} />
      {/* Tutashgan nuqta: LYNKO-X */}
      <circle cx="11" cy="21" r="3.4" className={dark ? "fill-white" : "fill-primary-900 dark:fill-white"} />
    </svg>
  );
}

export function Logo({
  size = 30,
  textClassName = "text-xl",
  className = "",
  tone = "auto",
}: {
  size?: number;
  textClassName?: string;
  className?: string;
  tone?: "auto" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} tone={tone} className="shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105" />
      <span
        className={`font-display font-extrabold tracking-[-0.03em] leading-none lowercase ${
          dark ? "text-white" : "text-gray-900 dark:text-white"
        } ${textClassName}`}
      >
        lynko<span className={dark ? "text-primary-300" : "text-primary-600 dark:text-primary-400"}>-x</span>
      </span>
    </span>
  );
}

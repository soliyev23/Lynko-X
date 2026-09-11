import { useId } from "react";

// LYNKO-X belgisi: yashil gradientli kvadrat ichida "L" va "x" monogrammasi
export function LogoMark({ size = 30, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  const grad = `lx-grad-${id}`;
  const shine = `lx-shine-${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="0.55" stopColor="#059669" />
          <stop offset="1" stopColor="#065f46" />
        </linearGradient>
        <radialGradient id={shine} cx="0.25" cy="0.15" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${grad})`} />
      <rect width="32" height="32" rx="9" fill={`url(#${shine})`} />
      {/* L */}
      <path d="M9.5 8.5v15h7.5" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* x */}
      <path d="M17.5 12.5l6 6M23.5 12.5l-6 6" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

// Belgi + yozuv: "LYNKO" qalin, "-X" yashil urg'u bilan
export function Logo({
  size = 30,
  textClassName = "text-xl",
  className = "",
}: {
  size?: number;
  textClassName?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark
        size={size}
        className="shrink-0 drop-shadow-[0_2px_6px_rgb(5_150_105_/_0.35)] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
      />
      <span className={`font-extrabold tracking-tight leading-none text-gray-900 dark:text-white ${textClassName}`}>
        LYNKO<span className="text-emerald-600 dark:text-emerald-400">-X</span>
      </span>
    </span>
  );
}

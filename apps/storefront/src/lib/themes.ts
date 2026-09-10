/**
 * Vitrina shablonlari. Har bir shablon CSS o'zgaruvchilari (rang, radius, shrift)
 * va layout variantlarini (sarlavha, hero, tarmoq, kartochka) belgilaydi.
 * Rang/shrift `theme-root` elementiga inline style sifatida qo'yiladi,
 * komponentlar esa globals.css'dagi `t-*` semantik klasslar orqali ularni ishlatadi.
 */
export type ThemeId = "classic" | "minimal" | "bold" | "elegant" | "market";

export interface Theme {
  id: ThemeId;
  name: string;
  vars: Record<string, string>;
  header: "left" | "center";
  hero: "banner" | "text" | "split" | "none";
  columns: string;
  card: "border" | "shadow" | "flat";
  sidebar: boolean;
  container: string;
  headingClass: string;
  dark: boolean;
}

const fonts = {
  inter: "var(--font-inter), system-ui, sans-serif",
  manrope: "var(--font-manrope), system-ui, sans-serif",
  grotesk: "var(--font-grotesk), system-ui, sans-serif",
  playfair: "var(--font-playfair), Georgia, serif",
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: {
    id: "classic",
    name: "Classic",
    vars: {
      "--bg": "#fafafa",
      "--surface": "#ffffff",
      "--text": "#111827",
      "--muted": "#6b7280",
      "--border": "#e5e7eb",
      "--primary": "#059669",
      "--primary-text": "#ffffff",
      "--primary-soft": "#ecfdf5",
      "--radius": "12px",
      "--radius-lg": "16px",
      "--font-heading": fonts.inter,
      "--font-body": fonts.inter,
    },
    header: "left",
    hero: "banner",
    columns: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    card: "border",
    sidebar: false,
    container: "max-w-6xl",
    headingClass: "font-bold tracking-tight",
    dark: false,
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    vars: {
      "--bg": "#ffffff",
      "--surface": "#ffffff",
      "--text": "#0a0a0a",
      "--muted": "#737373",
      "--border": "#e5e5e5",
      "--primary": "#0a0a0a",
      "--primary-text": "#ffffff",
      "--primary-soft": "#f5f5f5",
      "--radius": "0px",
      "--radius-lg": "0px",
      "--font-heading": fonts.manrope,
      "--font-body": fonts.manrope,
    },
    header: "center",
    hero: "text",
    columns: "grid-cols-2 md:grid-cols-3",
    card: "flat",
    sidebar: false,
    container: "max-w-6xl",
    headingClass: "font-semibold uppercase tracking-[0.2em]",
    dark: false,
  },
  bold: {
    id: "bold",
    name: "Bold",
    vars: {
      "--bg": "#0b1120",
      "--surface": "#151d2e",
      "--text": "#f8fafc",
      "--muted": "#94a3b8",
      "--border": "#273449",
      "--primary": "#f97316",
      "--primary-text": "#0b1120",
      "--primary-soft": "#2a1a0e",
      "--radius": "14px",
      "--radius-lg": "20px",
      "--font-heading": fonts.grotesk,
      "--font-body": fonts.grotesk,
    },
    header: "left",
    hero: "banner",
    columns: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    card: "shadow",
    sidebar: false,
    container: "max-w-6xl",
    headingClass: "font-bold tracking-tight",
    dark: true,
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    vars: {
      "--bg": "#faf7f2",
      "--surface": "#ffffff",
      "--text": "#2b2118",
      "--muted": "#8a7b6d",
      "--border": "#e8dfd3",
      "--primary": "#a67c37",
      "--primary-text": "#ffffff",
      "--primary-soft": "#f6eee1",
      "--radius": "6px",
      "--radius-lg": "10px",
      "--font-heading": fonts.playfair,
      "--font-body": fonts.inter,
    },
    header: "center",
    hero: "split",
    columns: "grid-cols-2 md:grid-cols-3",
    card: "shadow",
    sidebar: false,
    container: "max-w-6xl",
    headingClass: "font-medium",
    dark: false,
  },
  market: {
    id: "market",
    name: "Market",
    vars: {
      "--bg": "#f1f5f9",
      "--surface": "#ffffff",
      "--text": "#0f172a",
      "--muted": "#64748b",
      "--border": "#e2e8f0",
      "--primary": "#2563eb",
      "--primary-text": "#ffffff",
      "--primary-soft": "#dbeafe",
      "--radius": "8px",
      "--radius-lg": "12px",
      "--font-heading": fonts.inter,
      "--font-body": fonts.inter,
    },
    header: "left",
    hero: "none",
    columns: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    card: "border",
    sidebar: true,
    container: "max-w-7xl",
    headingClass: "font-bold",
    dark: false,
  },
};

export function getTheme(id: string | null | undefined): Theme {
  return THEMES[(id ?? "classic") as ThemeId] ?? THEMES.classic;
}

export const CARD_CLASS: Record<Theme["card"], string> = {
  border: "t-card-border",
  shadow: "t-card-shadow",
  flat: "t-card-flat",
};

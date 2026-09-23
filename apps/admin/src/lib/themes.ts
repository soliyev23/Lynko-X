/** Vitrina shablonlari ro'yxati — tanlash sahifasidagi preview uchun. */
export interface ThemeOption {
  id: "classic" | "minimal" | "bold" | "elegant" | "market";
  name: string;
  tagline: string;
  suits: string;
  font: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    primarySoft: string;
  };
  radius: number;
  header: "left" | "center";
  hero: "banner" | "text" | "split" | "none";
  columns: number;
  dark: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "Universal, toza va tanish ko'rinish",
    suits: "Har qanday do'kon",
    font: "Inter",
    colors: {
      bg: "#fafafa",
      surface: "#ffffff",
      text: "#111827",
      muted: "#6b7280",
      border: "#e5e7eb",
      primary: "#1f2937",
      primarySoft: "#f3f4f6",
    },
    radius: 6,
    header: "left",
    hero: "banner",
    columns: 4,
    dark: false,
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Oq fon, ko'p havo, katta rasmlar",
    suits: "Kiyim, butik, dizayn mahsulotlari",
    font: "Manrope",
    colors: {
      bg: "#ffffff",
      surface: "#ffffff",
      text: "#0a0a0a",
      muted: "#737373",
      border: "#e5e5e5",
      primary: "#0a0a0a",
      primarySoft: "#f5f5f5",
    },
    radius: 0,
    header: "center",
    hero: "text",
    columns: 3,
    dark: false,
  },
  {
    id: "bold",
    name: "Bold",
    tagline: "Qorong'i fon, yorqin to'q sariq urg'u",
    suits: "Elektronika, sport, gadjetlar",
    font: "Space Grotesk",
    colors: {
      bg: "#0b1120",
      surface: "#151d2e",
      text: "#f8fafc",
      muted: "#94a3b8",
      border: "#273449",
      primary: "#f97316",
      primarySoft: "#2a1a0e",
    },
    radius: 7,
    header: "left",
    hero: "banner",
    columns: 4,
    dark: true,
  },
  {
    id: "elegant",
    name: "Elegant",
    tagline: "Krem fon, serif sarlavhalar, oltin urg'u",
    suits: "Zargarlik, kosmetika, sovg'alar",
    font: "Playfair Display",
    colors: {
      bg: "#faf7f2",
      surface: "#ffffff",
      text: "#2b2118",
      muted: "#8a7b6d",
      border: "#e8dfd3",
      primary: "#a67c37",
      primarySoft: "#f6eee1",
    },
    radius: 3,
    header: "center",
    hero: "split",
    columns: 3,
    dark: false,
  },
  {
    id: "market",
    name: "Market",
    tagline: "Zich katalog, yon panelda kategoriyalar",
    suits: "Oziq-ovqat, xo'jalik, keng assortiment",
    font: "Inter",
    colors: {
      bg: "#f1f5f9",
      surface: "#ffffff",
      text: "#0f172a",
      muted: "#64748b",
      border: "#e2e8f0",
      primary: "#2563eb",
      primarySoft: "#dbeafe",
    },
    radius: 4,
    header: "left",
    hero: "none",
    columns: 5,
    dark: false,
  },
];

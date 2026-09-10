import type { Metadata } from "next";
import {
  Inter,
  Manrope,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

// Shablonlar shu shriftlardan tanlaydi (CSS o'zgaruvchilar orqali)
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "LYNKO-X",
  description: "LYNKO-X — O'zbekiston uchun onlayn-do'kon platformasi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${inter.variable} ${manrope.variable} ${grotesk.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

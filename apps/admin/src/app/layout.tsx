import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

// Sarlavha va logotip shrifti (font-display tokeni)
const manrope = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "LYNKO-X Admin",
  description: "LYNKO-X — do'kon boshqaruv paneli",
};

// Sahifa chizilishidan oldin saqlangan rejimni qo'llaydi (oq miltillashsiz)
const themeScript = `(function(){try{var t=localStorage.getItem("lynkox_admin_theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className={manrope.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased text-gray-900">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

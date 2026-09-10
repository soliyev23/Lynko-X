import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "LYNKO-X Admin",
  description: "LYNKO-X — do'kon boshqaruv paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="min-h-screen antialiased text-gray-900">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

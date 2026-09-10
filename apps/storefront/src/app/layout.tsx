import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="uz">
      <body className="min-h-screen antialiased text-gray-900">{children}</body>
    </html>
  );
}

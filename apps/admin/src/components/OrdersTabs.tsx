"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

/**
 * Buyurtmalar bo'limining ichki tablari. Sidebar yig'ilgan holatda ham
 * qoralamalar va tugallanmagan xaridlarga o'tish uchun.
 */
export function OrdersTabs() {
  const pathname = usePathname();
  const { t } = useI18n();
  const inDrafts = pathname.startsWith("/orders/drafts");
  const inAbandoned = pathname.startsWith("/orders/abandoned");
  const tabs = [
    { href: "/orders", label: t("orders"), active: !inDrafts && !inAbandoned },
    { href: "/orders/drafts", label: t("drafts"), active: inDrafts },
    { href: "/orders/abandoned", label: t("abandonedCheckouts"), active: inAbandoned },
  ];
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200" aria-label={t("orders")}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? "page" : undefined}
          className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            tab.active ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

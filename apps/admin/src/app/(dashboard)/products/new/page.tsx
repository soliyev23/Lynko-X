"use client";

import { ProductForm } from "@/components/ProductForm";
import { useI18n } from "@/lib/i18n";

export default function NewProductPage() {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("addProduct")}</h1>
      <ProductForm />
    </div>
  );
}

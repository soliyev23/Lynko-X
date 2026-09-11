"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProductForm, type ProductFormValues } from "@/components/ProductForm";
import { useI18n } from "@/lib/i18n";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useI18n();
  const [initial, setInitial] = useState<ProductFormValues | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    api<any>(`/products/${id}`).then((p) => {
      setName(p.name);
      setInitial({
        name: p.name,
        description: p.description ?? "",
        price: String(p.price),
        comparePrice: p.comparePrice != null ? String(p.comparePrice) : "",
        stock: String(p.stock),
        categoryId: p.categoryId ?? "",
        images: p.images ?? [],
        isActive: p.isActive,
        variants: (p.variants ?? []).map((v: any) => ({
          id: v.id,
          name: v.name,
          price: v.price != null ? String(v.price) : "",
          stock: String(v.stock),
        })),
      });
    });
  }, [id]);

  if (!initial) {
    return <div className="text-gray-400">{t("loading")}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {t("edit")}: {name}
      </h1>
      <ProductForm productId={id} initial={initial} />
    </div>
  );
}

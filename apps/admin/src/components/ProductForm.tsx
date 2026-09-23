"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ImageUploader } from "@/components/ImageUploader";
import { PlusIcon, XIcon } from "@/components/icons";

interface Category {
  id: string;
  name: string;
}

export interface VariantRow {
  id?: string;
  name: string;
  price: string;
  stock: string;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  categoryId: string;
  images: string[];
  isActive: boolean;
  variants: VariantRow[];
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "0",
  categoryId: "",
  images: [],
  isActive: true,
  variants: [],
};

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: ProductFormValues;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValues>(initial ?? emptyValues);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(console.error);
  }, []);

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    try {
      const created = await api<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      setCategories((c) => [...c, created]);
      set("categoryId", created.id);
      setNewCategory("");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      stock: Number(form.stock),
      categoryId: form.categoryId || undefined,
      images: form.images,
      isActive: form.isActive,
      variants: form.variants
        .filter((v) => v.name.trim())
        .map((v) => ({
          id: v.id,
          name: v.name.trim(),
          price: v.price ? Number(v.price) : undefined,
          stock: Number(v.stock) || 0,
        })),
    };
    try {
      if (productId) {
        await api(`/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      router.push("/products");
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  const input =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      {error && (
        <div className="bg-error-50 text-error-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">{t("name")}</span>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={input}
        />
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t("price")}
          </span>
          <input
            required
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t("comparePrice")}
          </span>
          <input
            type="number"
            min={0}
            value={form.comparePrice}
            onChange={(e) => set("comparePrice", e.target.value)}
            className={input}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            {t("stock")}
          </span>
          <input
            required
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className={input}
          />
        </label>
      </div>
      <div className="block">
        <span className="text-sm font-medium text-gray-700">
          {t("category")}
        </span>
        <div className="flex gap-2 mt-1">
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 bg-white flex-1"
          >
            <option value="">{t("noCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            placeholder={t("newCategory")}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 flex-1"
          />
          <button
            type="button"
            onClick={addCategory}
            className="rounded-lg border border-primary-300 text-primary-600 px-3 py-2 text-sm font-medium hover:bg-primary-50"
          >
            {t("add")}
          </button>
        </div>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          {t("description")}
        </span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className={input}
        />
      </label>
      <div className="block">
        <span className="text-sm font-medium text-gray-700 block mb-1">
          {t("variants")}
        </span>
        <p className="text-xs text-gray-500 mb-2">{t("variantHint")}</p>
        <div className="space-y-2">
          {form.variants.map((v, i) => (
            <div key={v.id ?? `new-${i}`} className="flex items-center gap-2">
              <input
                placeholder={t("variantName")}
                value={v.name}
                onChange={(e) =>
                  set(
                    "variants",
                    form.variants.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 bg-white"
              />
              <input
                type="number"
                min={0}
                placeholder={t("variantPrice")}
                value={v.price}
                onChange={(e) =>
                  set(
                    "variants",
                    form.variants.map((x, j) =>
                      j === i ? { ...x, price: e.target.value } : x,
                    ),
                  )
                }
                className="w-32 rounded-lg border border-gray-300 px-3 py-2 bg-white"
              />
              <input
                type="number"
                min={0}
                placeholder={t("stock")}
                value={v.stock}
                onChange={(e) =>
                  set(
                    "variants",
                    form.variants.map((x, j) =>
                      j === i ? { ...x, stock: e.target.value } : x,
                    ),
                  )
                }
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 bg-white"
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "variants",
                    form.variants.filter((_, j) => j !== i),
                  )
                }
                className="text-gray-400 hover:text-error-500 p-1.5"
                aria-label={t("delete")}
              >
                <XIcon size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set("variants", [
                ...form.variants,
                { name: "", price: "", stock: "0" },
              ])
            }
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 border border-primary-300 rounded-lg px-3 py-2 hover:bg-primary-50"
          >
            <PlusIcon size={14} />
            {t("addVariant")}
          </button>
        </div>
      </div>
      <div className="block">
        <span className="text-sm font-medium text-gray-700 block mb-2">
          {t("images")}
        </span>
        <ImageUploader
          images={form.images}
          onChange={(images) => set("images", images)}
        />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
          className="w-4 h-4 accent-primary-600"
        />
        <span className="text-sm text-gray-700">{t("active")}</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button
          disabled={busy}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5"
        >
          {busy ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="border border-gray-300 text-gray-600 rounded-lg px-5 py-2.5 hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

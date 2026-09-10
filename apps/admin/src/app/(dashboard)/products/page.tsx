"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: string[];
  category: { name: string } | null;
  variants: { stock: number }[];
}

function totalStock(p: Product): number {
  return p.variants.length
    ? p.variants.reduce((sum, v) => sum + v.stock, 0)
    : p.stock;
}

export default function ProductsPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState("");

  async function load(q = "") {
    const data = await api<Product[]>(
      `/products${q ? `?search=${encodeURIComponent(q)}` : ""}`,
    );
    setProducts(data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function remove(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    await api(`/products/${id}`, { method: "DELETE" });
    load(search);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("products")}</h1>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2"
        >
          <PlusIcon size={16} />
          {t("addProduct")}
        </Link>
      </div>
      <input
        placeholder={t("search")}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          load(e.target.value);
        }}
        className="mb-4 w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 bg-white"
      />
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">{t("name")}</th>
              <th className="text-left px-4 py-3 font-medium">
                {t("category")}
              </th>
              <th className="text-right px-4 py-3 font-medium">{t("price")}</th>
              <th className="text-right px-4 py-3 font-medium">{t("stock")}</th>
              <th className="text-center px-4 py-3 font-medium">
                {t("status")}
              </th>
              <th className="text-right px-4 py-3 font-medium">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    )}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      {p.variants.length > 0 && (
                        <div className="text-xs text-gray-400">
                          {p.variants.length} variant
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {p.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">{money(p.price)}</td>
                <td
                  className={`px-4 py-3 text-right ${totalStock(p) === 0 ? "text-red-600 font-semibold" : ""}`}
                >
                  {totalStock(p)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center justify-center rounded-full w-6 h-6 ${
                      p.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {p.isActive ? (
                      <CheckIcon size={13} />
                    ) : (
                      <MinusIcon size={13} />
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <Link
                    href={`/products/${p.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {t("edit")}
                  </Link>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-red-500 hover:underline"
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
            {products?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { ProductCard } from "@/lib/api";
import { money } from "@/lib/format";
import { CheckIcon, MinusIcon, PlusIcon } from "@/components/icons";

export function AddToCartButton({
  product,
  withQuantity = false,
}: {
  product: ProductCard;
  withQuantity?: boolean;
}) {
  const { add, items } = useCart();
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;

  const [selectedId, setSelectedId] = useState<string | null>(
    () => variants.find((v) => v.stock > 0)?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const price = selected ? (selected.price ?? product.price) : product.price;
  const stock = hasVariants ? (selected?.stock ?? 0) : product.stock;

  const inCart =
    items.find(
      (i) =>
        i.productId === product.id && i.variantId === (selected?.id ?? null),
    )?.quantity ?? 0;
  const soldOut = hasVariants
    ? variants.every((v) => v.stock === 0)
    : product.stock === 0;
  const maxed = inCart + (withQuantity ? quantity : 1) > stock;

  function handleAdd() {
    add(
      {
        productId: product.id,
        variantId: selected?.id ?? null,
        variantName: selected?.name ?? null,
        name: product.name,
        price,
        image: product.images[0] ?? null,
        stock,
      },
      withQuantity ? quantity : 1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  if (soldOut) {
    return (
      <span className="inline-block bg-gray-100 text-gray-400 rounded-xl px-4 py-2 text-sm font-medium">
        Tugagan
      </span>
    );
  }

  return (
    <div className="space-y-3">
      {hasVariants && (
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stock === 0}
              onClick={() => {
                setSelectedId(v.id);
                setQuantity(1);
              }}
              className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                v.stock === 0
                  ? "border-gray-200 text-gray-300 line-through"
                  : selectedId === v.id
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-emerald-400"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}
      {hasVariants && selected && withQuantity && (
        <div className="text-lg font-bold">
          {money(price)}
          <span className="text-sm text-gray-400 font-normal ml-2">
            Omborda: {stock} dona
          </span>
        </div>
      )}
      <div className="flex items-center gap-3">
        {withQuantity && (
          <div className="flex items-center border border-gray-300 rounded-xl">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-gray-500 hover:text-gray-900"
            >
              <MinusIcon size={15} />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="px-3 py-2.5 text-gray-500 hover:text-gray-900"
            >
              <PlusIcon size={15} />
            </button>
          </div>
        )}
        <button
          onClick={handleAdd}
          disabled={maxed || (hasVariants && !selected)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
            added
              ? "bg-green-500 text-white"
              : maxed
                ? "bg-gray-100 text-gray-400"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {added && <CheckIcon size={14} />}
          {added ? "Qo'shildi" : maxed ? "Savatda" : "Savatga"}
        </button>
      </div>
    </div>
  );
}

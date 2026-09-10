import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchJson,
  minPrice,
  totalStock,
  type ProductCard,
} from "@/lib/api";
import { money } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCart";
import { ArrowLeftIcon, PackageIcon } from "@/components/icons";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ store: string; slug: string }>;
}) {
  const { store: storeSlug, slug } = await params;
  const product = await fetchJson<ProductCard>(
    `/storefront/${storeSlug}/products/${slug}`,
  );
  if (!product) notFound();

  return (
    <div>
      <Link
        href={`/${storeSlug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600"
      >
        <ArrowLeftIcon size={15} />
        Barcha mahsulotlar
      </Link>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div>
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full rounded-2xl object-cover bg-gray-100 aspect-square"
            />
          ) : (
            <div className="w-full aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
              <PackageIcon size={72} strokeWidth={1.5} />
            </div>
          )}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.slice(1, 5).map((img) => (
                <img
                  key={img}
                  src={img}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                />
              ))}
            </div>
          )}
        </div>
        <div>
          {product.category && (
            <div className="text-sm text-emerald-600 font-medium mb-1">
              {product.category.name}
            </div>
          )}
          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>
          <div className="mb-4">
            <span className="text-2xl font-bold">
              {money(minPrice(product))}
              {product.variants.length > 0 &&
                new Set(
                  product.variants.map((v) => v.price ?? product.price),
                ).size > 1 &&
                " dan"}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-gray-400 line-through ml-3">
                {money(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mb-5">
            {totalStock(product) > 0
              ? `Omborda: ${totalStock(product)} dona`
              : "Omborda qolmagan"}
          </div>
          <AddToCartButton product={product} withQuantity />
          {product.description && (
            <div className="mt-8 text-gray-600 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

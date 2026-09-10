import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchJson,
  minPrice,
  totalStock,
  type ProductCard,
  type StoreInfo,
} from "@/lib/api";
import { money } from "@/lib/format";
import { getTheme } from "@/lib/themes";
import { AddToCartButton } from "@/components/AddToCart";
import { ArrowLeftIcon, PackageIcon } from "@/components/icons";

type Props = { params: Promise<{ store: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store: storeSlug, slug } = await params;
  const product = await fetchJson<ProductCard>(
    `/storefront/${storeSlug}/products/${slug}`,
  );
  if (!product) return { title: "Mahsulot topilmadi" };
  const description =
    product.description?.slice(0, 160) ??
    `${product.name} — ${money(minPrice(product))}`;
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { store: storeSlug, slug } = await params;
  const [store, product] = await Promise.all([
    fetchJson<StoreInfo>(`/storefront/${storeSlug}`),
    fetchJson<ProductCard>(`/storefront/${storeSlug}/products/${slug}`),
  ]);
  if (!store || !product) notFound();
  const theme = getTheme(store.theme);
  const pricesDiffer =
    product.variants.length > 0 &&
    new Set(product.variants.map((v) => v.price ?? product.price)).size > 1;

  return (
    <div>
      <Link
        href={`/${storeSlug}`}
        className="inline-flex items-center gap-1.5 text-sm t-muted hover:underline"
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
              className="w-full object-cover t-soft aspect-square t-rounded-lg"
            />
          ) : (
            <div className="w-full aspect-square t-soft t-muted flex items-center justify-center t-rounded-lg">
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
                  className="w-20 h-20 object-cover t-soft t-rounded"
                />
              ))}
            </div>
          )}
        </div>
        <div>
          {product.category && (
            <div className="text-sm t-primary font-medium mb-1">
              {product.category.name}
            </div>
          )}
          <h1 className={`t-heading text-2xl md:text-3xl mb-3 ${theme.headingClass}`}>
            {product.name}
          </h1>
          <div className="mb-4">
            <span className="text-2xl font-bold">
              {money(minPrice(product))}
              {pricesDiffer && " dan"}
            </span>
            {product.comparePrice && (
              <span className="text-lg t-muted line-through ml-3">
                {money(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="text-sm t-muted mb-5">
            {totalStock(product) > 0
              ? `Omborda: ${totalStock(product)} dona`
              : "Omborda qolmagan"}
          </div>
          <AddToCartButton product={product} withQuantity />
          {product.description && (
            <div className="mt-8 t-muted whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

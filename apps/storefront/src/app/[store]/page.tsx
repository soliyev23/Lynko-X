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
import { AddToCartButton } from "@/components/AddToCart";
import { PackageIcon } from "@/components/icons";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { store: slug } = await params;
  const { category } = await searchParams;

  const [store, products] = await Promise.all([
    fetchJson<StoreInfo>(`/storefront/${slug}`),
    fetchJson<ProductCard[]>(
      `/storefront/${slug}/products${category ? `?category=${category}` : ""}`,
    ),
  ]);
  if (!store || !products) notFound();

  return (
    <div>
      {store.description && (
        <p className="text-gray-500 mb-6 max-w-2xl">{store.description}</p>
      )}

      {store.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/${slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
              !category
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"
            }`}
          >
            Barchasi
          </Link>
          {store.categories.map((c) => (
            <Link
              key={c.id}
              href={`/${slug}?category=${c.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                category === c.slug
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition"
          >
            <Link href={`/${slug}/p/${p.slug}`} className="block">
              {p.images[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full aspect-square object-cover bg-gray-100"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
                  <PackageIcon size={48} strokeWidth={1.5} />
                </div>
              )}
            </Link>
            <div className="p-3 flex-1 flex flex-col">
              <Link
                href={`/${slug}/p/${p.slug}`}
                className="font-medium hover:text-emerald-600 line-clamp-2"
              >
                {p.name}
              </Link>
              <div className="mt-auto pt-3">
                <div className="mb-2">
                  <span className="font-bold">
                    {money(minPrice(p))}
                    {p.variants.length > 0 &&
                      new Set(p.variants.map((v) => v.price ?? p.price)).size >
                        1 &&
                      " dan"}
                  </span>
                  {p.comparePrice && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      {money(p.comparePrice)}
                    </span>
                  )}
                </div>
                {p.variants.length > 0 ? (
                  totalStock(p) === 0 ? (
                    <span className="inline-block bg-gray-100 text-gray-400 rounded-xl px-4 py-2 text-sm font-medium">
                      Tugagan
                    </span>
                  ) : (
                    <Link
                      href={`/${slug}/p/${p.slug}`}
                      className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
                    >
                      Tanlash
                    </Link>
                  )
                ) : (
                  <AddToCartButton product={p} />
                )}
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-16">
            Hozircha mahsulotlar yo'q
          </div>
        )}
      </div>
    </div>
  );
}

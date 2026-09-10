import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchJson,
  minPrice,
  totalStock,
  type ProductListResponse,
  type StoreInfo,
} from "@/lib/api";
import { money } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCart";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PackageIcon,
  SearchIcon,
} from "@/components/icons";

function buildUrl(
  slug: string,
  params: { category?: string; search?: string; page?: number },
) {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.search) q.set("search", params.search);
  if (params.page && params.page > 1) q.set("page", String(params.page));
  const qs = q.toString();
  return `/${slug}${qs ? `?${qs}` : ""}`;
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}) {
  const { store: slug } = await params;
  const { category, search, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (search) query.set("search", search);
  query.set("page", String(page));

  const [store, result] = await Promise.all([
    fetchJson<StoreInfo>(`/storefront/${slug}`),
    fetchJson<ProductListResponse>(
      `/storefront/${slug}/products?${query.toString()}`,
    ),
  ]);
  if (!store || !result) notFound();
  const products = result.items;

  const chip = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium border transition ${
      active
        ? "bg-emerald-600 text-white border-emerald-600"
        : "bg-white text-gray-600 border-gray-300 hover:border-emerald-400"
    }`;

  return (
    <div>
      {store.description && (
        <p className="text-gray-500 mb-6 max-w-2xl">{store.description}</p>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        {store.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 flex-1">
            <Link href={buildUrl(slug, { search })} className={chip(!category)}>
              Barchasi
            </Link>
            {store.categories.map((c) => (
              <Link
                key={c.id}
                href={buildUrl(slug, { category: c.slug, search })}
                className={chip(category === c.slug)}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
        <form action={`/${slug}`} className="relative md:w-72">
          {category && <input type="hidden" name="category" value={category} />}
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            name="search"
            defaultValue={search ?? ""}
            placeholder="Mahsulot qidirish"
            className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>
      </div>

      {search && (
        <p className="text-sm text-gray-500 mb-4">
          «{search}» bo'yicha {result.total} ta natija ·{" "}
          <Link
            href={buildUrl(slug, { category })}
            className="text-emerald-600 hover:underline"
          >
            tozalash
          </Link>
        </p>
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
            {search ? "Hech narsa topilmadi" : "Hozircha mahsulotlar yo'q"}
          </div>
        )}
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {page > 1 ? (
            <Link
              href={buildUrl(slug, { category, search, page: page - 1 })}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:border-emerald-400"
            >
              <ChevronLeftIcon size={16} />
              Oldingi
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-300">
              <ChevronLeftIcon size={16} />
              Oldingi
            </span>
          )}
          <span className="text-sm text-gray-500">
            {page} / {result.totalPages}
          </span>
          {page < result.totalPages ? (
            <Link
              href={buildUrl(slug, { category, search, page: page + 1 })}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:border-emerald-400"
            >
              Keyingi
              <ChevronRightIcon size={16} />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-300">
              Keyingi
              <ChevronRightIcon size={16} />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

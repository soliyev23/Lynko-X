import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchJson,
  minPrice,
  totalStock,
  type ProductCard,
  type ProductListResponse,
  type StoreInfo,
} from "@/lib/api";
import { money } from "@/lib/format";
import { CARD_CLASS, getTheme, type Theme } from "@/lib/themes";
import { AddToCartButton } from "@/components/AddToCart";
import { StoreHero } from "@/components/StoreHero";
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

function ProductCardView({
  p,
  slug,
  theme,
}: {
  p: ProductCard;
  slug: string;
  theme: Theme;
}) {
  const flat = theme.card === "flat";
  const pricesDiffer =
    p.variants.length > 0 &&
    new Set(p.variants.map((v) => v.price ?? p.price)).size > 1;

  return (
    <div
      className={`${CARD_CLASS[theme.card]} overflow-hidden flex flex-col transition ${
        theme.card === "shadow" ? "hover:-translate-y-0.5" : ""
      }`}
    >
      <Link href={`/${slug}/p/${p.slug}`} className="block">
        {p.images[0] ? (
          <img
            src={p.images[0]}
            alt={p.name}
            className={`w-full aspect-square object-cover t-soft ${flat ? "t-rounded-lg" : ""}`}
          />
        ) : (
          <div
            className={`w-full aspect-square t-soft flex items-center justify-center t-muted ${flat ? "t-rounded-lg" : ""}`}
          >
            <PackageIcon size={48} strokeWidth={1.5} />
          </div>
        )}
      </Link>
      <div className={`flex-1 flex flex-col ${flat ? "pt-3" : "p-3"}`}>
        <Link
          href={`/${slug}/p/${p.slug}`}
          className="font-medium hover:underline line-clamp-2"
        >
          {p.name}
        </Link>
        <div className="mt-auto pt-3">
          <div className="mb-2">
            <span className="font-bold">
              {money(minPrice(p))}
              {pricesDiffer && " dan"}
            </span>
            {p.comparePrice && (
              <span className="text-sm t-muted line-through ml-2">
                {money(p.comparePrice)}
              </span>
            )}
          </div>
          {p.variants.length > 0 ? (
            totalStock(p) === 0 ? (
              <span className="t-btn-muted px-4 py-2 text-sm">Tugagan</span>
            ) : (
              <Link
                href={`/${slug}/p/${p.slug}`}
                className="t-btn px-4 py-2 text-sm"
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
  );
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
  const theme = getTheme(store.theme);
  const products = result.items;
  const showHero = !search && !category && page === 1;

  const categoryChips = store.categories.length > 0 && (
    <div className="flex flex-wrap gap-2 flex-1">
      <Link
        href={buildUrl(slug, { search })}
        className={`t-chip ${!category ? "t-chip-active" : ""}`}
      >
        Barchasi
      </Link>
      {store.categories.map((c) => (
        <Link
          key={c.id}
          href={buildUrl(slug, { category: c.slug, search })}
          className={`t-chip ${category === c.slug ? "t-chip-active" : ""}`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );

  const searchForm = (
    <form action={`/${slug}`} className="relative md:w-72">
      {category && <input type="hidden" name="category" value={category} />}
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 t-muted"
      />
      <input
        name="search"
        defaultValue={search ?? ""}
        placeholder="Mahsulot qidirish"
        className="t-input pl-9 text-sm"
      />
    </form>
  );

  const catalog = (
    <div id="catalog">
      {search && (
        <p className="text-sm t-muted mb-4">
          «{search}» bo'yicha {result.total} ta natija ·{" "}
          <Link href={buildUrl(slug, { category })} className="t-link">
            tozalash
          </Link>
        </p>
      )}
      <div className={`grid ${theme.columns} gap-4 ${theme.card === "flat" ? "gap-x-6 gap-y-10" : ""}`}>
        {products.map((p) => (
          <ProductCardView key={p.id} p={p} slug={slug} theme={theme} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center t-muted py-16">
            {search ? "Hech narsa topilmadi" : "Hozircha mahsulotlar yo'q"}
          </div>
        )}
      </div>

      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {page > 1 ? (
            <Link
              href={buildUrl(slug, { category, search, page: page - 1 })}
              className="t-btn-outline px-4 py-2 text-sm"
            >
              <ChevronLeftIcon size={16} />
              Oldingi
            </Link>
          ) : (
            <span className="t-btn-outline px-4 py-2 text-sm opacity-40">
              <ChevronLeftIcon size={16} />
              Oldingi
            </span>
          )}
          <span className="text-sm t-muted">
            {page} / {result.totalPages}
          </span>
          {page < result.totalPages ? (
            <Link
              href={buildUrl(slug, { category, search, page: page + 1 })}
              className="t-btn-outline px-4 py-2 text-sm"
            >
              Keyingi
              <ChevronRightIcon size={16} />
            </Link>
          ) : (
            <span className="t-btn-outline px-4 py-2 text-sm opacity-40">
              Keyingi
              <ChevronRightIcon size={16} />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (theme.sidebar) {
    return (
      <div>
        {showHero && <StoreHero store={store} theme={theme} />}
        <div className="lg:grid lg:grid-cols-[220px_1fr] gap-6">
          <aside className="hidden lg:block">
            <div className="t-card-border p-4 sticky top-20">
              <div className="text-xs font-semibold uppercase tracking-wide t-muted mb-3">
                Kategoriyalar
              </div>
              <nav className="space-y-1">
                <Link
                  href={buildUrl(slug, { search })}
                  className={`block px-2 py-1.5 text-sm t-rounded ${
                    !category ? "t-soft t-primary font-semibold" : "hover:t-soft"
                  }`}
                >
                  Barchasi
                </Link>
                {store.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={buildUrl(slug, { category: c.slug, search })}
                    className={`block px-2 py-1.5 text-sm t-rounded ${
                      category === c.slug
                        ? "t-soft t-primary font-semibold"
                        : "hover:t-soft"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="lg:hidden flex-1">{categoryChips}</div>
              <div className="hidden lg:block flex-1" />
              {searchForm}
            </div>
            {catalog}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showHero && <StoreHero store={store} theme={theme} />}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        {categoryChips || <div className="flex-1" />}
        {searchForm}
      </div>
      {catalog}
    </div>
  );
}

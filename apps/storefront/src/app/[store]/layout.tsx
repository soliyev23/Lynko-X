import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJson, type StoreInfo } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
import { getTheme } from "@/lib/themes";
import { Header } from "@/components/Header";

type Props = {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { store: slug } = await params;
  const store = await fetchJson<StoreInfo>(`/storefront/${slug}`);
  if (!store) return { title: "Do'kon topilmadi" };
  const description =
    store.description ?? `${store.name} — onlayn-do'kon. LYNKO-X platformasida.`;
  return {
    title: { default: store.name, template: `%s — ${store.name}` },
    description,
    openGraph: {
      title: store.name,
      description,
      type: "website",
      ...(store.bannerUrl || store.logoUrl
        ? { images: [store.bannerUrl ?? store.logoUrl!] }
        : {}),
    },
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const { store: slug } = await params;
  const store = await fetchJson<StoreInfo>(`/storefront/${slug}`);
  if (!store) notFound();
  const theme = getTheme(store.theme);

  return (
    <div
      className="theme-root"
      data-theme={theme.id}
      style={theme.vars as React.CSSProperties}
    >
      <CartProvider storeSlug={slug}>
        <Header store={store} theme={theme} />
        <main className={`${theme.container} w-full mx-auto px-4 py-6 flex-1`}>
          {children}
        </main>
        <footer className="border-t t-border mt-12 py-6">
          <div
            className={`${theme.container} mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm t-muted`}
          >
            <div>
              {store.name}
              {store.telegram && (
                <>
                  {" · "}
                  <a
                    href={`https://t.me/${store.telegram}`}
                    className="hover:underline"
                  >
                    @{store.telegram}
                  </a>
                </>
              )}
              {store.phone && (
                <>
                  {" · "}
                  <a href={`tel:${store.phone}`} className="hover:underline">
                    {store.phone}
                  </a>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/${slug}/track`} className="hover:underline">
                Buyurtmani kuzatish
              </Link>
              <span className="opacity-70">
                <Link href="/" className="hover:underline">
                  LYNKO-X
                </Link>{" "}
                bilan yaratilgan
              </span>
            </div>
          </div>
        </footer>
      </CartProvider>
    </div>
  );
}

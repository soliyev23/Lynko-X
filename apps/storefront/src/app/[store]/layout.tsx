import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJson, type StoreInfo } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
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
      ...(store.logoUrl ? { images: [store.logoUrl] } : {}),
    },
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const { store: slug } = await params;
  const store = await fetchJson<StoreInfo>(`/storefront/${slug}`);
  if (!store) notFound();

  return (
    <CartProvider storeSlug={slug}>
      <Header store={store} />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-gray-200 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <div>
            {store.name}
            {store.telegram && (
              <>
                {" · "}
                <a
                  href={`https://t.me/${store.telegram}`}
                  className="hover:text-emerald-600"
                >
                  @{store.telegram}
                </a>
              </>
            )}
            {store.phone && (
              <>
                {" · "}
                <a href={`tel:${store.phone}`} className="hover:text-emerald-600">
                  {store.phone}
                </a>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${slug}/track`} className="hover:text-emerald-600">
              Buyurtmani kuzatish
            </Link>
            <span className="text-gray-300">
              <Link href="/" className="hover:text-emerald-600">
                LYNKO-X
              </Link>{" "}
              bilan yaratilgan
            </span>
          </div>
        </div>
      </footer>
    </CartProvider>
  );
}

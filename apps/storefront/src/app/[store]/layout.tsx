import { notFound } from "next/navigation";
import { fetchJson, type StoreInfo } from "@/lib/api";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store: slug } = await params;
  const store = await fetchJson<StoreInfo>(`/storefront/${slug}`);
  if (!store) notFound();

  return (
    <CartProvider storeSlug={slug}>
      <Header store={store} />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-400">
        {store.name} ·{" "}
        {store.telegram && (
          <a
            href={`https://t.me/${store.telegram}`}
            className="hover:text-emerald-600"
          >
            @{store.telegram}
          </a>
        )}{" "}
        · <span className="text-gray-300">LYNKO-X bilan yaratilgan</span>
      </footer>
    </CartProvider>
  );
}

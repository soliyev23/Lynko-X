export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Server komponentlar uchun: xatoda null qaytaradi (notFound uchun). */
export async function fetchJson<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

/** Klient komponentlar uchun: xatoda Error otadi. */
export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Xatolik: ${res.status}`);
    throw new Error(msg);
  }
  return res.json();
}

export interface StoreInfo {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  telegram: string | null;
  logoUrl: string | null;
  deliveryFee: number;
  categories: { id: string; name: string; slug: string }[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number | null;
  stock: number;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[];
  description?: string | null;
  category: { name: string; slug: string } | null;
  variants: ProductVariant[];
}

export interface ProductListResponse {
  items: ProductCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Variantli mahsulot uchun eng arzon narx. */
export function minPrice(p: ProductCard): number {
  if (!p.variants.length) return p.price;
  return Math.min(...p.variants.map((v) => v.price ?? p.price));
}

/** Umumiy ombor qoldig'i (variantli bo'lsa — yig'indisi). */
export function totalStock(p: ProductCard): number {
  if (!p.variants.length) return p.stock;
  return p.variants.reduce((sum, v) => sum + v.stock, 0);
}

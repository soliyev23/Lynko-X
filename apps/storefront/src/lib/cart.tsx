"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  variantId: string | null;
  variantName: string | null;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
}

function sameLine(item: CartItem, productId: string, variantId: string | null) {
  return item.productId === productId && item.variantId === variantId;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  remove: (productId: string, variantId: string | null) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  storeSlug,
  children,
}: {
  storeSlug: string;
  children: ReactNode;
}) {
  const storageKey = `lynkox_cart_${storeSlug}`;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        // Eski formatdagi (variantsiz) savatlar bilan ham mos ishlaydi
        const parsed: CartItem[] = JSON.parse(saved).map((i: any) => ({
          variantId: null,
          variantName: null,
          ...i,
        }));
        setItems(parsed);
      }
    } catch {}
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (loaded) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, loaded, storageKey]);

  const add: CartContextValue["add"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) =>
        sameLine(i, item.productId, item.variantId),
      );
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.variantId)
            ? { ...i, quantity: Math.min(i.quantity + quantity, item.stock) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
    });
  };

  const setQuantity: CartContextValue["setQuantity"] = (
    productId,
    variantId,
    quantity,
  ) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => !sameLine(i, productId, variantId))
        : prev.map((i) =>
            sameLine(i, productId, variantId)
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i,
          ),
    );
  };

  const remove: CartContextValue["remove"] = (productId, variantId) =>
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, add, setQuantity, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart faqat CartProvider ichida ishlaydi");
  return ctx;
}

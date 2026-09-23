"use client";

import { createContext, useContext } from "react";
import type { SubscriptionInfo } from "@/components/badges";
import type { PlanPayment } from "@/components/SubscriptionCard";

export interface StoreNote {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string } | null;
}

export interface StoreDetail {
  store: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    phone: string | null;
    telegram: string | null;
    logoUrl: string | null;
    theme: string;
    plan: "FREE" | "BASIC" | "PRO";
    isActive: boolean;
    blockReason: string | null;
    blockedAt: string | null;
    deliveryFee: number;
    createdAt: string;
    telegramConfigured: boolean;
    owner: { id: string; name: string; email: string; createdAt: string };
    _count: { products: number; orders: number; categories: number };
  };
  usage: { plan: string; products: number; limit: number | null };
  subscription: SubscriptionInfo;
  payments: PlanPayment[];
  notes: StoreNote[];
  analytics: {
    totals: { products: number; orders: number; newOrders: number; revenue: number };
    period: { orders30: number; revenue30: number; ordersPrev30: number; revenuePrev30: number };
    daily: { day: string; orders: number; revenue: number }[];
    statusBreakdown: { status: string; count: number }[];
    topProducts: { productId: string | null; name: string; quantity: number; revenue: number }[];
    lowStock: { productId: string; name: string; stock: number }[];
    recentOrders: {
      id: string; number: number; customerName: string; total: number;
      status: string; paymentStatus: string; createdAt: string;
    }[];
  };
}

interface Ctx {
  data: StoreDetail;
  setData: (updater: (d: StoreDetail) => StoreDetail) => void;
  refresh: () => Promise<void>;
}

const StoreCtx = createContext<Ctx | null>(null);
export const StoreDetailProvider = StoreCtx.Provider;

/** Owner-panel: tanlangan do'kon ma'lumotlari (layout yuklaydi, ichki sahifalar ishlatadi) */
export function useStoreDetail() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStoreDetail faqat do'kon sahifalari ichida ishlaydi");
  return c;
}

export const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3001";

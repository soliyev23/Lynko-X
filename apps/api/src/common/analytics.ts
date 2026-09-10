import { Prisma } from "@lynko-x/db";
import { PrismaService } from "../prisma/prisma.service";
import { PLAN_LIMITS } from "./plans";

export interface DayPoint {
  day: string; // YYYY-MM-DD
  orders: number;
  revenue: number;
}

const DAYS = 30;
const LOW_STOCK = 3;

/** So'nggi N kun (bugun bilan tugaydi), YYYY-MM-DD ko'rinishida. */
export function lastDays(n = DAYS): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i),
    );
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function dayKey(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

/** Bazadan kelgan kunlik qatorlarni bo'sh kunlar bilan to'ldiradi. */
export function fillDays(
  rows: { day: Date | string; orders: number; revenue: number }[],
  n = DAYS,
): DayPoint[] {
  const byDay = new Map(rows.map((r) => [dayKey(r.day), r]));
  return lastDays(n).map((day) => {
    const r = byDay.get(day);
    return { day, orders: r?.orders ?? 0, revenue: r?.revenue ?? 0 };
  });
}

export function fillCounts(
  rows: { day: Date | string; count: number }[],
  n = DAYS,
): { day: string; count: number }[] {
  const byDay = new Map(rows.map((r) => [dayKey(r.day), r.count]));
  return lastDays(n).map((day) => ({ day, count: byDay.get(day) ?? 0 }));
}

export function planUsage(plan: string, products: number) {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;
  return { plan, products, limit: Number.isFinite(limit) ? limit : null };
}

/**
 * Bitta do'kon bo'yicha tahlil. Sotuvchi paneli ham, platforma
 * administratorining do'kon sahifasi ham shu funksiyani ishlatadi.
 */
export async function storeAnalytics(prisma: PrismaService, storeId: string) {
  const [daily, statusRows, topProducts, products, recentOrders, totals, windows] =
    await Promise.all([
      prisma.$queryRaw<{ day: Date; orders: number; revenue: number }[]>(
        Prisma.sql`
          SELECT date_trunc('day', "createdAt")::date AS day,
                 count(*)::int AS orders,
                 coalesce(sum(total), 0)::float8 AS revenue
          FROM "Order"
          WHERE "storeId" = ${storeId}
            AND status <> 'CANCELLED'
            AND "createdAt" >= now() - interval '30 days'
          GROUP BY 1 ORDER BY 1`,
      ),
      prisma.order.groupBy({
        by: ["status"],
        where: { storeId },
        _count: { _all: true },
      }),
      prisma.$queryRaw<
        { productId: string | null; name: string; quantity: number; revenue: number }[]
      >(Prisma.sql`
          SELECT oi."productId" AS "productId",
                 coalesce(p.name, oi.name) AS name,
                 sum(oi.quantity)::int AS quantity,
                 sum(oi.price * oi.quantity)::float8 AS revenue
          FROM "OrderItem" oi
          JOIN "Order" o ON o.id = oi."orderId"
          LEFT JOIN "Product" p ON p.id = oi."productId"
          WHERE o."storeId" = ${storeId} AND o.status <> 'CANCELLED'
          GROUP BY 1, 2
          ORDER BY quantity DESC
          LIMIT 5`),
      prisma.product.findMany({
        where: { storeId, isActive: true },
        select: {
          id: true,
          name: true,
          stock: true,
          variants: { select: { name: true, stock: true } },
        },
      }),
      prisma.order.findMany({
        where: { storeId },
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          number: true,
          customerName: true,
          total: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      Promise.all([
        prisma.product.count({ where: { storeId } }),
        prisma.order.count({ where: { storeId } }),
        prisma.order.count({ where: { storeId, status: "NEW" } }),
        prisma.order.aggregate({
          where: { storeId, status: { not: "CANCELLED" } },
          _sum: { total: true },
        }),
      ]),
      prisma.$queryRaw<{ period: string; orders: number; revenue: number }[]>(
        Prisma.sql`
          SELECT CASE WHEN "createdAt" >= now() - interval '30 days'
                      THEN 'current' ELSE 'previous' END AS period,
                 count(*)::int AS orders,
                 coalesce(sum(total), 0)::float8 AS revenue
          FROM "Order"
          WHERE "storeId" = ${storeId}
            AND status <> 'CANCELLED'
            AND "createdAt" >= now() - interval '60 days'
          GROUP BY 1`,
      ),
    ]);

  // Ombori tugayotgan mahsulotlar (variantli bo'lsa — variant bo'yicha)
  const lowStock = products
    .flatMap((p) =>
      p.variants.length
        ? p.variants
            .filter((v) => v.stock <= LOW_STOCK)
            .map((v) => ({ productId: p.id, name: `${p.name} — ${v.name}`, stock: v.stock }))
        : p.stock <= LOW_STOCK
          ? [{ productId: p.id, name: p.name, stock: p.stock }]
          : [],
    )
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  const current = windows.find((w) => w.period === "current");
  const previous = windows.find((w) => w.period === "previous");
  const [productCount, orderCount, newOrders, revenueAgg] = totals;

  return {
    totals: {
      products: productCount,
      orders: orderCount,
      newOrders,
      revenue: revenueAgg._sum.total ?? 0,
    },
    period: {
      orders30: current?.orders ?? 0,
      revenue30: current?.revenue ?? 0,
      ordersPrev30: previous?.orders ?? 0,
      revenuePrev30: previous?.revenue ?? 0,
    },
    daily: fillDays(daily),
    statusBreakdown: statusRows.map((r) => ({
      status: r.status,
      count: r._count._all,
    })),
    topProducts,
    lowStock,
    recentOrders,
  };
}

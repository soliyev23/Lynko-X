import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@lynko-x/db";
import { PrismaService } from "../prisma/prisma.service";
import {
  fillCounts,
  fillDays,
  planUsage,
  storeAnalytics,
} from "../common/analytics";
import { PLANS } from "../common/plans";
import { AdminUpdateStoreDto } from "./dto";

/** LYNKO-X platforma egasi uchun: barcha do'konlar, sotuvchilar va tahlil. */
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [merchants, stores, activeStores, products, orders, revenue, latestStores] =
      await Promise.all([
        this.prisma.user.count({ where: { role: "MERCHANT" } }),
        this.prisma.store.count(),
        this.prisma.store.count({ where: { isActive: true } }),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          where: { status: { not: "CANCELLED" } },
          _sum: { total: true },
        }),
        this.prisma.store.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            isActive: true,
            createdAt: true,
            owner: { select: { name: true, email: true } },
          },
        }),
      ]);
    return {
      merchants,
      stores,
      activeStores,
      products,
      orders,
      revenue: revenue._sum.total ?? 0,
      latestStores,
    };
  }

  /** Platforma bo'yicha vaqt qatorlari va taqsimotlar (so'nggi 30 kun). */
  async analytics() {
    const [daily, newStores, planRows, statusRows, topStores, activeRows, windows] =
      await Promise.all([
        this.prisma.$queryRaw<{ day: Date; orders: number; revenue: number }[]>(
          Prisma.sql`
            SELECT date_trunc('day', "createdAt")::date AS day,
                   count(*)::int AS orders,
                   coalesce(sum(total), 0)::float8 AS revenue
            FROM "Order"
            WHERE status <> 'CANCELLED'
              AND "createdAt" >= now() - interval '30 days'
            GROUP BY 1 ORDER BY 1`,
        ),
        this.prisma.$queryRaw<{ day: Date; count: number }[]>(Prisma.sql`
            SELECT date_trunc('day', "createdAt")::date AS day, count(*)::int AS count
            FROM "Store"
            WHERE "createdAt" >= now() - interval '30 days'
            GROUP BY 1 ORDER BY 1`),
        this.prisma.store.groupBy({ by: ["plan"], _count: { _all: true } }),
        this.prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
        this.prisma.$queryRaw<
          { id: string; name: string; slug: string; plan: string; orders: number; revenue: number }[]
        >(Prisma.sql`
            SELECT s.id, s.name, s.slug, s.plan::text AS plan,
                   count(o.id)::int AS orders,
                   coalesce(sum(o.total), 0)::float8 AS revenue
            FROM "Store" s
            LEFT JOIN "Order" o ON o."storeId" = s.id AND o.status <> 'CANCELLED'
            GROUP BY s.id
            ORDER BY revenue DESC, orders DESC
            LIMIT 10`),
        this.prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
            SELECT count(DISTINCT "storeId")::int AS count
            FROM "Order"
            WHERE "createdAt" >= now() - interval '7 days'`),
        this.prisma.$queryRaw<{ period: string; orders: number; revenue: number; stores: number }[]>(
          Prisma.sql`
            SELECT CASE WHEN "createdAt" >= now() - interval '30 days'
                        THEN 'current' ELSE 'previous' END AS period,
                   count(*)::int AS orders,
                   coalesce(sum(total), 0)::float8 AS revenue,
                   count(DISTINCT "storeId")::int AS stores
            FROM "Order"
            WHERE status <> 'CANCELLED'
              AND "createdAt" >= now() - interval '60 days'
            GROUP BY 1`,
        ),
      ]);

    const current = windows.find((w) => w.period === "current");
    const previous = windows.find((w) => w.period === "previous");

    return {
      daily: fillDays(daily),
      newStores: fillCounts(newStores),
      planBreakdown: PLANS.map((plan) => ({
        plan,
        count: planRows.find((r) => r.plan === plan)?._count._all ?? 0,
      })),
      statusBreakdown: statusRows.map((r) => ({
        status: r.status,
        count: r._count._all,
      })),
      topStores,
      activeStores7d: activeRows[0]?.count ?? 0,
      period: {
        orders30: current?.orders ?? 0,
        revenue30: current?.revenue ?? 0,
        sellingStores30: current?.stores ?? 0,
        ordersPrev30: previous?.orders ?? 0,
        revenuePrev30: previous?.revenue ?? 0,
      },
    };
  }

  listStores(search?: string) {
    return this.prisma.store.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
              { owner: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        theme: true,
        isActive: true,
        phone: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Do'konning to'liq kartasi: ma'lumotlari, egasi, tahlili, mahsulotlari. */
  async getStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, createdAt: true } },
        _count: { select: { products: true, orders: true, categories: true } },
      },
    });
    if (!store) throw new NotFoundException("Do'kon topilmadi");

    const [analytics, products] = await Promise.all([
      storeAnalytics(this.prisma, id),
      this.prisma.product.findMany({
        where: { storeId: id },
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          isActive: true,
          images: true,
          createdAt: true,
          category: { select: { name: true } },
          variants: { select: { name: true, stock: true, price: true } },
        },
      }),
    ]);

    // Bot tokeni platforma egasiga ham ko'rsatilmaydi — faqat ulanganligi
    const { telegramBotToken, telegramChatId, ...safe } = store;
    return {
      store: {
        ...safe,
        telegramConfigured: Boolean(telegramBotToken && telegramChatId),
      },
      usage: planUsage(store.plan, store._count.products),
      analytics,
      products,
    };
  }

  async updateStore(id: string, dto: AdminUpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    return this.prisma.store.update({
      where: { id },
      data: dto,
      select: { id: true, plan: true, isActive: true },
    });
  }

  listUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            slug: true,
            name: true,
            plan: true,
            isActive: true,
            _count: { select: { orders: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

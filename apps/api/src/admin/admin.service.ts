import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@lynko-x/db";
import { PrismaService } from "../prisma/prisma.service";
import {
  fillCounts,
  fillDays,
  planUsage,
  storeAnalytics,
} from "../common/analytics";
import {
  EXPIRING_SOON_DAYS,
  PLANS,
  PLAN_PRICES,
  addDays,
  addMonths,
  effectivePlan,
  subscriptionInfo,
} from "../common/plans";
import { AddPlanPaymentDto, AdminUpdateStoreDto } from "./dto";

const SUB_SELECT = {
  id: true,
  plan: true,
  planExpiresAt: true,
  isTrial: true,
  isActive: true,
} as const;

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
        this.prisma.store.findMany({
          select: { plan: true, planExpiresAt: true, isTrial: true },
        }),
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
        count: planRows.filter((s) => effectivePlan(s) === plan).length,
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

  async listStores(search?: string) {
    const stores = await this.prisma.store.findMany({
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
        planExpiresAt: true,
        isTrial: true,
        theme: true,
        isActive: true,
        phone: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true, orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return stores.map((s) => ({ ...s, subscription: subscriptionInfo(s) }));
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

    const [analytics, payments, products] = await Promise.all([
      storeAnalytics(this.prisma, id),
      this.prisma.planPayment.findMany({
        where: { storeId: id },
        orderBy: { paidAt: "desc" },
        take: 50,
        include: { createdBy: { select: { name: true } } },
      }),
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
      usage: planUsage(store, store._count.products),
      subscription: subscriptionInfo(store),
      analytics,
      products,
      payments,
    };
  }

  async updateStore(id: string, dto: AdminUpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { id } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    const data: Prisma.StoreUpdateInput = {};
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.plan !== undefined) {
      data.plan = dto.plan;
      if (dto.plan === "FREE") {
        data.planExpiresAt = null;
        data.isTrial = false;
      }
    }
    if (dto.planExpiresAt !== undefined)
      data.planExpiresAt = dto.planExpiresAt ? new Date(dto.planExpiresAt) : null;
    if (dto.isTrial !== undefined) data.isTrial = dto.isTrial;
    const updated = await this.prisma.store.update({
      where: { id },
      data,
      select: SUB_SELECT,
    });
    return { ...updated, subscription: subscriptionInfo(updated) };
  }

  /**
   * Qo'lda to'lov: yozuv saqlanadi va do'kon tarifi/muddati yangilanadi.
   * Xuddi shu pullik tarif hali tugamagan bo'lsa (sinov emas), yangi davr
   * eski muddat oxiridan boshlanadi; aks holda hozirdan.
   */
  async addPayment(storeId: string, dto: AddPlanPaymentDto, adminId: string) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new NotFoundException("Do'kon topilmadi");
    const now = new Date();
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : now;
    const continues =
      store.plan === dto.plan &&
      !store.isTrial &&
      store.planExpiresAt != null &&
      store.planExpiresAt.getTime() > now.getTime();
    const periodStart = continues ? (store.planExpiresAt as Date) : now;
    const periodEnd = addMonths(periodStart, dto.months);
    const [payment, updated] = await this.prisma.$transaction([
      this.prisma.planPayment.create({
        data: {
          storeId,
          plan: dto.plan,
          amount: dto.amount,
          method: dto.method,
          months: dto.months,
          paidAt,
          periodStart,
          periodEnd,
          note: dto.note?.trim() || null,
          createdById: adminId,
        },
        include: { createdBy: { select: { name: true } } },
      }),
      this.prisma.store.update({
        where: { id: storeId },
        data: { plan: dto.plan, planExpiresAt: periodEnd, isTrial: false },
        select: SUB_SELECT,
      }),
    ]);
    return { payment, store: { ...updated, subscription: subscriptionInfo(updated) } };
  }

  /** Xato yozilgan to'lovni o'chirish. Muddat avtomatik qayta hisoblanmaydi — admin qo'lda to'g'rilaydi. */
  async deletePayment(storeId: string, paymentId: string) {
    const payment = await this.prisma.planPayment.findFirst({
      where: { id: paymentId, storeId },
    });
    if (!payment) throw new NotFoundException("To'lov topilmadi");
    await this.prisma.planPayment.delete({ where: { id: paymentId } });
    return { ok: true };
  }

  /** Obuna va to'lovlar bo'yicha umumiy ko'rinish (owner-panel "To'lovlar" sahifasi). */
  async billing() {
    const now = new Date();
    const soon = addDays(now, EXPIRING_SOON_DAYS);
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const [paidStores, totalStores, monthRows, allTime, recentPayments] =
      await Promise.all([
        this.prisma.store.findMany({
          where: { plan: { not: "FREE" } },
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            plan: true,
            planExpiresAt: true,
            isTrial: true,
            owner: { select: { name: true, email: true } },
          },
        }),
        this.prisma.store.count(),
        this.prisma.$queryRaw<{ month: Date; amount: number; count: number }[]>(
          Prisma.sql`
            SELECT date_trunc('month', "paidAt") AS month,
                   COALESCE(SUM(amount), 0)::float8 AS amount,
                   COUNT(*)::int AS count
            FROM "PlanPayment"
            WHERE "paidAt" >= ${from}
            GROUP BY 1 ORDER BY 1`,
        ),
        this.prisma.planPayment.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
        this.prisma.planPayment.findMany({
          orderBy: { paidAt: "desc" },
          take: 30,
          include: {
            store: { select: { id: true, name: true, slug: true } },
            createdBy: { select: { name: true } },
          },
        }),
      ]);

    const subs = paidStores.map((s) => ({ ...s, subscription: subscriptionInfo(s, now) }));
    const trial = subs.filter((s) => s.subscription.status === "TRIAL").length;
    const active = subs.filter((s) => s.subscription.status === "ACTIVE").length;
    const expired = subs.filter((s) => s.subscription.status === "EXPIRED");
    const expiringSoon = subs
      .filter((s) => {
        const e = s.subscription.expiresAt;
        return e != null && e.getTime() > now.getTime() && e.getTime() <= soon.getTime();
      })
      .sort((a, b) => a.subscription.expiresAt!.getTime() - b.subscription.expiresAt!.getTime());

    // So'nggi 12 oy, bo'sh oylar 0 bilan
    const byMonth = new Map(
      monthRows.map((r) => [new Date(r.month).toISOString().slice(0, 7), r]),
    );
    const months: { month: string; amount: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = d.toISOString().slice(0, 7);
      const row = byMonth.get(key);
      months.push({ month: key, amount: row?.amount ?? 0, count: row?.count ?? 0 });
    }
    const thisMonth = months[months.length - 1]?.amount ?? 0;
    const lastMonth = months[months.length - 2]?.amount ?? 0;

    return {
      totals: {
        thisMonth,
        lastMonth,
        allTime: allTime._sum.amount ?? 0,
        paymentsCount: allTime._count._all,
        trial,
        active,
        expired: expired.length,
        free: totalStores - paidStores.length,
        stores: totalStores,
      },
      months,
      expiringSoon,
      expired: expired.sort(
        (a, b) => b.subscription.expiresAt!.getTime() - a.subscription.expiresAt!.getTime(),
      ),
      recentPayments,
      prices: PLAN_PRICES,
    };
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
